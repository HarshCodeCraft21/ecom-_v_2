import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
      maxLength: [120, "Product title cannot exceed 120 characters"]
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Original price cannot be negative"]
    },
    discountedPrice: {
      type: Number,
      default: 0,
      min: [0, "Discounted price cannot be negative"]
    },
    image: {
      type: String,
      default: "https://via.placeholder.com/600/FFFFFF/000000?text=No+Image+Uploaded"
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product category is required"]
    }
  },
  {
    timestamps: true
  }
);

// Mongoose validation hook for pricing logic
productSchema.pre("validate", function (next) {
  // Ensure that discountedPrice is strictly less than price
  if (this.discountedPrice !== undefined && this.discountedPrice >= this.price) {
    this.invalidate(
      "discountedPrice",
      `Discounted price (${this.discountedPrice}) must be strictly less than the original price (${this.price})`
    );
  }
  next();
});

export const Product = mongoose.model("Product", productSchema);
