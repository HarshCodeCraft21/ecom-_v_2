import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { errorHandler } from './middleware/error.middleware.js';

// Route imports
import authRouter from './routes/auth.routes.js';
import categoryRouter from './routes/category.routes.js';
import productRouter from './routes/product.routes.js';
import cartRouter from './routes/cart.routes.js';
import couponRouter from './routes/coupon.routes.js';

const app = express();

// Standard middlewares
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(morgan("dev"));

// Route declarations
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/coupons", couponRouter);

// Root fallback route
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Welcome to MERN E-Commerce Backend API",
    version: "1.0.0"
  });
});

// Centralized error handling middleware (must be mounted last)
app.use(errorHandler);

export { app };
