import Cart from "../model/cartModel.js";
import Product from "../model/productModel.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api_Error.js";
import UserActivity from "../model/userActivityModel.js";
import { ApiResponse } from "../utils/api_Response.js";
import mongoose from "mongoose";


// -------------------------------------------
// ADD TO CART
// -------------------------------------------
const addToCart = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    // ✅ Validate productId
    if (!mongoose.isValidObjectId(productId)) {
        throw new ApiError(400, "Invalid product ID");
    }

    // ✅ Validate quantity
    const qty = quantity && quantity > 0 ? quantity : 1;

    // ✅ Check product exists
    const product = await Product.exists({ _id: productId });
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    // ✅ Get or create cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
        cart = new Cart({ userId, items: [] });
    }

    // ✅ Check if product already exists in cart
    const existingItem = cart.items.find(
        (item) => item.productId.toString() === productId
    );

    if (existingItem) {
        existingItem.quantity += qty;
    } else {
        cart.items.push({ productId, quantity: qty });
    }

    await cart.save();

    // ✅ Optimized activity tracking (NO duplicates)
    await UserActivity.findOneAndUpdate(
        { userId, productId, action: "cart" },
        { $inc: { weight: 0.5 } },
        { upsert: true, new: true }
    );

    return res.status(200).json(
        new ApiResponse(200, cart, "Product added to cart successfully")
    );
});


// -------------------------------------------
// GET CART
// -------------------------------------------
const getCart = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const userCart = await Cart.findOne({ userId })
        .populate("items.productId", "name price image1");

    if (!userCart) {
        return res.status(200).json(
            new ApiResponse(200, { items: [] }, "Cart is empty")
        );
    }

    return res.status(200).json(
        new ApiResponse(200, userCart, "Cart fetched successfully")
    );
});


// -------------------------------------------
// UPDATE CART ITEM
// -------------------------------------------
const updateCart = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { productId, quantity } = req.body;

    // ✅ Validate inputs
    if (!mongoose.isValidObjectId(productId)) {
        throw new ApiError(400, "Invalid product ID");
    }

    if (quantity === undefined || quantity < 1) {
        throw new ApiError(400, "Quantity must be at least 1");
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    const item = cart.items.find(
        (item) => item.productId.toString() === productId
    );

    if (!item) {
        throw new ApiError(404, "Product not found in cart");
    }

    item.quantity = quantity;
    await cart.save();

    return res.status(200).json(
        new ApiResponse(200, cart, "Cart updated successfully")
    );
});


// -------------------------------------------
// REMOVE ITEM FROM CART
// -------------------------------------------
const removeItem = asyncHandler(async (req, res) => {
    const { productId } = req.body;
    const userId = req.user._id;

    // ✅ Validate productId
    if (!mongoose.isValidObjectId(productId)) {
        throw new ApiError(400, "Invalid product ID");
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    const exists = cart.items.some(
        (item) => item.productId.toString() === productId
    );

    if (!exists) {
        throw new ApiError(404, "Item not found in cart");
    }

    cart.items = cart.items.filter(
        (item) => item.productId.toString() !== productId
    );

    await cart.save();

    // ✅ Track negative behavior
    await UserActivity.findOneAndUpdate(
        { userId, productId, action: "cart" },
        { $inc: { weight: -0.3 } },
        { upsert: true }
    );

    return res.status(200).json(
        new ApiResponse(200, cart, "Item removed from cart successfully")
    );
});


// -------------------------------------------
// CLEAR CART
// -------------------------------------------
const clearCart = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    cart.items = [];
    await cart.save();

    return res.status(200).json(
        new ApiResponse(200, cart, "Cart cleared successfully")
    );
});


export {
    addToCart,
    getCart,
    updateCart,
    removeItem,
    clearCart
};