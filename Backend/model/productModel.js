import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    required: false, // optional field
    trim: true
  },
  type: {
    type: String,
    required: false, // optional field (e.g., “T-Shirt”, “Jeans”)
    trim: true
  },
  image1: {
    type: String,
    required: true
  },
  image2: {
    type: String,
    required: true
  },
  image3: {
    type: String,
    required: true
  },
  image4: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  subCategory: {
    type: String,
    required: true
  },
  bestSeller: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);
export default Product;
