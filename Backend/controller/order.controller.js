import User from "../model/userModel.js";
import dotenv from "dotenv";
dotenv.config();
import Product from "../model/productModel.js";
import Order from "../model/orderModel.js";
import mongoose from "mongoose";
import crypto from "crypto";
import Razorpay from "razorpay";

import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api_Response.js";
import { ApiError } from "../utils/api_Error.js";

// Razorpay Instance
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});

// PLACE ORDER (Cash on Delivery) 
const placeOrder = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { shippingAddress, paymentMethod, items } = req.body;

  if (!shippingAddress || Object.values(shippingAddress).some((val) => !val)) {
    throw new ApiError(400, "Incomplete shipping address");
  }
  if (!paymentMethod) {
    throw new ApiError(400, "Payment method is required");
  }
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, "Cannot place an empty order. Cart is empty.");
  }

  const productIdsInCart = items
    .map((item) => item.productId)
    .filter(mongoose.isValidObjectId);

  const products = await Product.find({
    _id: { $in: productIdsInCart },
  }).select("name price");

  const productMap = new Map(products.map((p) => [p._id.toString(), p]));
  const finalOrderItems = [];
  let calculatedTotalAmount = 0;
  const SHIPPING_COST = 10;

  for (const item of items) {
    const productId = item.productId.toString();
    const quantity = item.qty;
    const product = productMap.get(productId);

    if (!product || quantity <= 0) {
      throw new ApiError(
        400,
        `Item in cart (${productId}) is unavailable or invalid.`
      );
    }

    finalOrderItems.push({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity,
    });

    calculatedTotalAmount += product.price * quantity;
  }

  calculatedTotalAmount += SHIPPING_COST;

  const newOrder = new Order({
    userId,
    items: finalOrderItems,
    shippingAddress,
    paymentMethod,
    totalAmount: calculatedTotalAmount,
    status: "Pending",
  });

  const savedOrder = await newOrder.save();
  await User.updateOne({ _id: userId }, { $set: { cartData: {} } });

  return res
    .status(201)
    .json(new ApiResponse(201, savedOrder, "Order placed successfully"));
});

//PLACE ORDER (Razorpay) 
const placeOrderRazorPay = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { shippingAddress, items } = req.body;

  if (!shippingAddress || Object.values(shippingAddress).some((val) => !val)) {
    throw new ApiError(400, "Incomplete shipping address");
  }
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, "Cannot place an empty order.");
  }

  const productIds = items.map((i) => i.productId).filter(mongoose.isValidObjectId);
  const products = await Product.find({ _id: { $in: productIds } }).select("name price");

  const productMap = new Map(products.map((p) => [p._id.toString(), p]));
  const finalItems = [];
  let total = 0;
  const SHIPPING_COST = 10;

  for (const item of items) {
    const product = productMap.get(item.productId.toString());
    if (!product) throw new ApiError(404, "Product not found");

    finalItems.push({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: item.qty,
    });

    total += product.price * item.qty;
  }

  total += SHIPPING_COST;

  //Create Razorpay Order
  const razorpayOrder = await razorpayInstance.orders.create({
    amount: total * 100, // amount in paisa
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
    notes: { userId: userId.toString() },
  });

  // Create DB Order
  const order = new Order({
    userId,
    items: finalItems,
    shippingAddress,
    paymentMethod: "Online",
    totalAmount: total,
    status: "Pending", 
    razorpayOrderId: razorpayOrder.id,
  });

  await order.save();

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        orderId: order._id,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY, 
      },
      "Razorpay order created successfully"
    )
  );
});

// VERIFY RAZORPAY PAYMENT ---
const verifyRazorPayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new ApiError(400, "Invalid payment details");
  }

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    throw new ApiError(400, "Payment signature mismatch");
  }

  const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
  if (!order) throw new ApiError(404, "Order not found");

  order.status = "Confirmed";
  order.razorpayPaymentId = razorpay_payment_id;
  await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Payment verified successfully"));
});

//  - GET USER ORDER HISTORY 
const getOrderHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const orders = await Order.find({ userId }).sort({ createdAt: -1 });
  return res
    .status(200)
    .json(new ApiResponse(200, orders, "User order history fetched successfully"));
});

//  GET SINGLE ORDER DETAILS 
const getOrderDetails = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { orderId } = req.params;

  if (!mongoose.isValidObjectId(orderId)) {
    throw new ApiError(400, "Invalid Order ID");
  }

  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found");

  if (order.userId.toString() !== userId.toString()) {
    throw new ApiError(403, "Unauthorized access");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order details retrieved successfully"));
});

//  CANCEL ORDER ---
const cancelOrder = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { orderId } = req.params;

  if (!mongoose.isValidObjectId(orderId)) {
    throw new ApiError(400, "Invalid Order ID");
  }

  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found");

  if (order.userId.toString() !== userId.toString()) {
    throw new ApiError(403, "Unauthorized to cancel this order");
  }

  if (order.status !== "Pending") {
    throw new ApiError(400, `Cannot cancel order with status: ${order.status}`);
  }

  order.status = "Cancelled";
  await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order cancelled successfully"));
});

// ADMIN: UPDATE ORDER STATUS ---
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const allowedStatus = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];
  if (!allowedStatus.includes(status)) throw new ApiError(400, "Invalid status");

  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found");

  order.status = status;
  await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order status updated successfully"));
});

//  ADMIN: GET ALL ORDERS ---
const adminGetAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).sort({ createdAt: -1 });
  return res
    .status(200)
    .json(new ApiResponse(200, orders, "All orders fetched successfully"));
});

//  ADMIN: DELETE ORDER 
const adminDeleteOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  if (!mongoose.isValidObjectId(orderId)) {
    throw new ApiError(400, "Invalid Order ID");
  }

  const order = await Order.findByIdAndDelete(orderId);
  if (!order) throw new ApiError(404, "Order not found");

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Order deleted successfully"));
});

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
