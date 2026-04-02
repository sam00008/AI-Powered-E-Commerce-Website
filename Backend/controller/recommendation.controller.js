import Order from "../model/orderModel.js";
import Product from "../model/productModel.js";
import UserActivity from "../model/userActivityModel.js";
import { ApiResponse } from "../utils/api_Response.js";
import { ApiError } from "../utils/api_Error.js";
import { asyncHandler } from "../utils/async-handler.js";
import mongoose from "mongoose";

// -----------------------------------------------------------
// 1. FREQUENTLY BOUGHT TOGETHER
// -----------------------------------------------------------
export const getFrequentlyBoughtTogether = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const limit = Number(req.query.limit) || 10; // ✅ added

    if (!mongoose.isValidObjectId(productId)) {
        throw new ApiError(400, "Invalid productId");
    }

    const orders = await Order.find({
        "items.productId": productId
    });

    const productFrequency = {};

    for (const order of orders) {
        for (const item of order.items) {
            const id = item.productId.toString();

            if (id !== productId) {
                productFrequency[id] = (productFrequency[id] || 0) + 1;
            }
        }
    }

    const sortedProducts = Object.entries(productFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit); // ✅ dynamic

    const productIds = sortedProducts.map(([id]) => id);

    const products = await Product.find({
        _id: { $in: productIds }
    });

    // ✅ FIX ranking
    const finalProducts = productIds.map(id =>
        products.find(p => p._id.toString() === id)
    ).filter(Boolean);

    return res.status(200).json(
        new ApiResponse(200, finalProducts, "Frequently bought together products")
    );
});

// -----------------------------------------------------------
// 2. PERSONALIZED RECOMMENDATIONS
// -----------------------------------------------------------
export const getPersonalizedRecommendations = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const limit = Number(req.query.limit) || 10; // ✅ added

    const activities = await UserActivity.find({ userId });

    // ✅ FIX cold start
    if (!activities.length) {
        const trending = await Product.find({})
            .sort({ createdAt: -1 })
            .limit(limit);

        return res.status(200).json(
            new ApiResponse(200, trending, "Trending products")
        );
    }

    const score = {};

    for (const act of activities) {
        const id = act.productId.toString();
        score[id] = (score[id] || 0) + act.weight;
    }

    const sorted = Object.entries(score)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit); // ✅ dynamic

    const productIds = sorted.map(([id]) => id);

    const products = await Product.find({
        _id: { $in: productIds }
    });

    // ✅ FIX ranking
    const sortedProducts = productIds.map(id =>
        products.find(p => p._id.toString() === id)
    ).filter(Boolean);

    return res.status(200).json(
        new ApiResponse(200, sortedProducts, "Personalized recommendations")
    );
});


// -----------------------------------------------------------
// 3. SIMILAR PRODUCTS
// -----------------------------------------------------------
export const getSimilarProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const limit = Number(req.query.limit) || 10; // ✅ added

    if (!mongoose.isValidObjectId(productId)) {
        throw new ApiError(400, "Invalid productId");
    }

    const product = await Product.findById(productId);

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    const similar = await Product.find({
        _id: { $ne: productId },
        $or: [
            { category: product.category },
            { subCategory: product.subCategory },
            ...(product.tags?.length ? [{ tags: { $in: product.tags } }] : [])
        ]
    }).limit(limit); // ✅ dynamic

    return res.status(200).json(
        new ApiResponse(200, similar, "Similar products fetched successfully")
    );
});