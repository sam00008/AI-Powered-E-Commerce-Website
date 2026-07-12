import mongoose from "mongoose";
import Order from "../model/orderModel.js";
import Product from "../model/productModel.js";
import UserActivity from "../model/userActivityModel.js";
import { ApiResponse } from "../utils/api_Response.js";
import { ApiError } from "../utils/api_Error.js";
import { asyncHandler } from "../utils/async-handler.js";

// 1. FREQUENTLY BOUGHT TOGETHER
export const getFrequentlyBoughtTogether = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const limit = Number(req.query.limit) || 4; 

    if (!mongoose.isValidObjectId(productId)) {
        throw new ApiError(400, "Invalid productId");
    }

    const frequentProductIds = await Order.aggregate([
        { $match: { "items.productId": new mongoose.Types.ObjectId(productId) } },
        { $unwind: "$items" },
        { $match: { "items.productId": { $ne: new mongoose.Types.ObjectId(productId) } } },
        { $group: { _id: "$items.productId", frequency: { $sum: 1 } } },
        { $sort: { frequency: -1 } },
        { $limit: limit }
    ]);

    const productIds = frequentProductIds.map(item => item._id);
    const products = await Product.find({ _id: { $in: productIds } });

    // Keep highest frequency first
    const finalProducts = productIds.map(id =>
        products.find(p => p._id.toString() === id.toString())
    ).filter(Boolean);

    return res.status(200).json(
        new ApiResponse(200, finalProducts, "Frequently bought together products")
    );
});


// 2. PERSONALIZED RECOMMENDATIONS
export const getPersonalizedRecommendations = asyncHandler(async (req, res) => {
    // FIX: Fallback to prevent crash if auth middleware fails
    if (!req.user || !req.user._id) {
        throw new ApiError(401, "Unauthorized request");
    }
    
    const userId = req.user._id;
    const limit = Number(req.query.limit) || 5; 

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const scoredProducts = await UserActivity.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId), timestamp: { $gte: thirtyDaysAgo } } },
        { $group: { _id: "$productId", totalScore: { $sum: "$weight" } } },
        { $sort: { totalScore: -1 } },
        { $limit: limit }
    ]);

    if (!scoredProducts.length) {
        const trending = await Product.find({ bestSeller: true })
            .sort({ createdAt: -1 })
            .limit(limit);

        return res.status(200).json(
            new ApiResponse(200, trending, "Trending products")
        );
    }

    const productIds = scoredProducts.map(item => item._id);
    const products = await Product.find({ _id: { $in: productIds } });

    const sortedProducts = productIds.map(id =>
        products.find(p => p._id.toString() === id.toString())
    ).filter(Boolean);

    return res.status(200).json(
        new ApiResponse(200, sortedProducts, "Personalized recommendations")
    );
});


// 3. SIMILAR PRODUCTS
export const getSimilarProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const limit = Number(req.query.limit) || 4; 

    if (!mongoose.isValidObjectId(productId)) {
        throw new ApiError(400, "Invalid productId");
    }

    const product = await Product.findById(productId);
    if (!product) throw new ApiError(404, "Product not found");

    const similar = await Product.find({
        _id: { $ne: productId },
        $or: [
            { category: product.category },
            { subCategory: product.subCategory },
            ...(product.tags?.length ? [{ tags: { $in: product.tags } }] : [])
        ]
    }).limit(limit);

    return res.status(200).json(
        new ApiResponse(200, similar, "Similar products fetched successfully")
    );
});