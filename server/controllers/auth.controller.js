import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { User } from '../models/user.model.js';

// Standard secure HTTP-only cookie options for JWT
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000 // 1 day
};

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Manual validation layer (supplementing Mongoose validators)
  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email, and password fields are required");
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  // Create user (bcrypt pre-save hook handles password hashing)
  const user = await User.create({
    name,
    email,
    password,
    role: role || "user"
  });

  // Verify creation
  const createdUser = await User.findById(user._id).select("-password");
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  // Generate JWT token
  const token = createdUser.generateAccessToken();

  return res
    .status(201)
    .cookie("token", token, cookieOptions)
    .json(new ApiResponse(201, { user: createdUser, token }, "User registered successfully"));
});

/**
 * @desc    Log in an existing user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  // Find user and explicitly fetch password since it's hidden by default in schema
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new ApiError(404, "Invalid credentials. User not found.");
  }

  // Verify password using bcrypt model helper
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials. Incorrect password.");
  }

  // Generate JWT token
  const token = user.generateAccessToken();

  // Fetch user details without password for the response body
  const loggedInUser = await User.findById(user._id).select("-password");

  return res
    .status(200)
    .cookie("token", token, cookieOptions)
    .json(new ApiResponse(200, { user: loggedInUser, token }, "User logged in successfully"));
});
