import mongoose from "mongoose";

const userActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
    index: true
  },

  action: {
    type: String,
    enum: ["view", "cart", "purchase"],
    required: true
  },

  weight: {
    type: Number,
    default: 1
  },

  timestamp: {
    type: Date,
    default: Date.now
  }

}, {
  timestamps: true
});

//  Important for fast recommendation queries
userActivitySchema.index({ userId: 1, productId: 1 });

export default mongoose.model("UserActivity", userActivitySchema);
