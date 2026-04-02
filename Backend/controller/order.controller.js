import User from "../model/userModel.js";
import Product from "../model/productModel.js";
import Order from "../model/orderModel.js";
import mongoose from "mongoose";
import crypto from "crypto";
import Razorpay from "razorpay";
import dotenv from "dotenv";

import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api_Response.js";
import { ApiError } from "../utils/api_Error.js";
import UserActivity from "../model/userActivityModel.js";

dotenv.config();

// ✅ Razorpay Instance
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});

const SHIPPING_COST = 10;

// ==============================
// 🟢 PLACE ORDER (COD)
// ==============================
const placeOrder = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { shippingAddress, paymentMethod, items } = req.body;

  // ✅ Validation
  if (!shippingAddress || Object.values(shippingAddress).some(v => !v)) {
    throw new ApiError(400, "Incomplete shipping address");
  }

  if (!paymentMethod) {
    throw new ApiError(400, "Payment method is required");
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  // ✅ Fetch Products
  const productIds = items
    .map(i => i.productId)
    .filter(mongoose.isValidObjectId);

  const products = await Product.find({ _id: { $in: productIds } })
    .select("name price");

  const productMap = new Map(products.map(p => [p._id.toString(), p]));

  let totalAmount = 0;
  const finalItems = [];

  for (const item of items) {
    const product = productMap.get(item.productId.toString());

    if (!product || item.qty <= 0) {
      throw new ApiError(400, "Invalid product in cart");
    }

    finalItems.push({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: item.qty,
    });

    totalAmount += product.price * item.qty;
  }

  totalAmount += SHIPPING_COST;

  // ✅ Create Order
  const order = await Order.create({
    userId,
    items: finalItems,
    shippingAddress,
    paymentMethod,
    totalAmount,
    status: "Pending",
  });

  // ✅ Clear cart (optional improvement)
  await User.updateOne({ _id: userId }, { $set: { cartData: {} } });

  // ✅ Track purchase activity (optimized)
  await Promise.all(
    finalItems.map(item =>
      UserActivity.findOneAndUpdate(
        { userId, productId: item.productId, action: "purchase" },
        { $inc: { weight: 1 } },
        { upsert: true }
      )
    )
  );

  return res
    .status(201)
    .json(new ApiResponse(201, order, "Order placed successfully"));
});


// ==============================
// 💳 PLACE ORDER (RAZORPAY)
// ==============================
const placeOrderRazorPay = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { shippingAddress, items } = req.body;

  if (!shippingAddress || Object.values(shippingAddress).some(v => !v)) {
    throw new ApiError(400, "Incomplete shipping address");
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  const productIds = items
    .map(i => i.productId)
    .filter(mongoose.isValidObjectId);

  const products = await Product.find({ _id: { $in: productIds } })
    .select("name price");

  const productMap = new Map(products.map(p => [p._id.toString(), p]));

  let total = 0;
  const finalItems = [];

  for (const item of items) {
    const product = productMap.get(item.productId.toString());

    if (!product || item.qty <= 0) {
      throw new ApiError(400, "Invalid product");
    }

    finalItems.push({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: item.qty,
    });

    total += product.price * item.qty;
  }

  total += SHIPPING_COST;

  // ✅ Create Razorpay Order
  const razorpayOrder = await razorpayInstance.orders.create({
    amount: total * 100,
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
    notes: { userId: userId.toString() },
  });

  // ✅ Save Order in DB
  const order = await Order.create({
    userId,
    items: finalItems,
    shippingAddress,
    paymentMethod: "Online",
    totalAmount: total,
    status: "Pending",
    razorpayOrderId: razorpayOrder.id,
  });

  return res.status(201).json(
    new ApiResponse(201, {
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY,
    }, "Razorpay order created")
  );
});


// ==============================
// ✅ VERIFY PAYMENT
// ==============================
const verifyRazorPayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new ApiError(400, "Invalid payment details");
  }

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generatedSignature !== razorpay_signature) {
    throw new ApiError(400, "Payment verification failed");
  }

  const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });

  if (!order) throw new ApiError(404, "Order not found");

  order.status = "Confirmed";
  order.razorpayPaymentId = razorpay_payment_id;

  await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Payment verified"));
});


// ==============================
// 📦 USER ORDERS
// ==============================
const getOrderHistory = asyncHandler(async (req, res) => {
  const orders = await Order.find({ userId: req.user._id })
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "Order history fetched"));
});


// ==============================
// 📄 ORDER DETAILS
// ==============================
const getOrderDetails = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user._id;

  if (!mongoose.isValidObjectId(orderId)) {
    throw new ApiError(400, "Invalid Order ID");
  }

  const order = await Order.findById(orderId);

  if (!order) throw new ApiError(404, "Order not found");

  if (order.userId.toString() !== userId.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order details"));
});


// ==============================
// ❌ CANCEL ORDER
// ==============================
const cancelOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  if (!mongoose.isValidObjectId(orderId)) {
    throw new ApiError(400, "Invalid Order ID");
  }

  const order = await Order.findById(orderId);

  if (!order) throw new ApiError(404, "Order not found");

  if (order.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  if (order.status !== "Pending") {
    throw new ApiError(400, "Cannot cancel this order");
  }

  order.status = "Cancelled";
  await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order cancelled"));
});


// ==============================
// 🛠 ADMIN CONTROLS
// ==============================
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const allowed = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];

  if (!allowed.includes(status)) {
    throw new ApiError(400, "Invalid status");
  }

  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found");

  order.status = status;
  await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Status updated"));
});


const adminGetAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "All orders fetched"));
});


const adminDeleteOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  if (!mongoose.isValidObjectId(orderId)) {
    throw new ApiError(400, "Invalid Order ID");
  }

  const order = await Order.findByIdAndDelete(orderId);

  if (!order) throw new ApiError(404, "Order not found");

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Order deleted"));
});


// ==============================
// EXPORTS
// ==============================
export {
  placeOrder,
  placeOrderRazorPay,
  verifyRazorPayPayment,
  getOrderHistory,
  getOrderDetails,
  cancelOrder,
  updateOrderStatus,
  adminGetAllOrders,
  adminDeleteOrder,
};