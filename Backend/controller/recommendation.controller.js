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


// 2. PERSONALIZED RECOMMENDATIONS (AI-Powered Content Profiling)
export const getPersonalizedRecommendations = asyncHandler(async (req, res) => {
    // Fallback to prevent crash if auth middleware fails
    if (!req.user || !req.user._id) {
        throw new ApiError(401, "Unauthorized request");
    }
    
    const userId = req.user._id;
    const limit = Number(req.query.limit) || 5; 

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // STEP 1: Analyze user history to find favorite categories and average price tier
    const userTasteProfile = await UserActivity.aggregate([
        { 
            $match: { 
                userId: new mongoose.Types.ObjectId(userId), 
                timestamp: { $gte: thirtyDaysAgo } 
            } 
        },
        {
            $lookup: {
                from: "products", // Must match your MongoDB collection name exactly
                localField: "productId",
                foreignField: "_id",
                as: "productDetails"
            }
        },
        { $unwind: "$productDetails" },
        {
            $group: {
                _id: null,
                interactedProductIds: { $addToSet: "$productId" },
                preferredCategories: { $addToSet: "$productDetails.category" },
                preferredSubCategories: { $addToSet: "$productDetails.subCategory" },
                avgPriceTier: { $avg: "$productDetails.price" } // Determines their spending power
            }
        }
    ]);

    // FALLBACK: If the user has no history, show trending/bestselling products
    if (!userTasteProfile.length || !userTasteProfile[0].preferredCategories.length) {
        const trending = await Product.find({ bestSeller: true })
            .sort({ createdAt: -1 })
            .limit(limit);

        return res.status(200).json(
            new ApiResponse(200, trending, "Trending products (No user history found)")
        );
    }

    const { interactedProductIds, preferredCategories, preferredSubCategories, avgPriceTier } = userTasteProfile[0];

    // STEP 2: Find NEW products that match their categories, sorted by price relevance
    const dynamicRecommendations = await Product.aggregate([
        {
            $match: {
                // Do not show items they have already viewed/bought
                _id: { $nin: interactedProductIds },
                // Must match their preferred categories or subcategories
                $or: [
                    { category: { $in: preferredCategories } },
                    { subCategory: { $in: preferredSubCategories } }
                ]
            }
        },
        {
            $addFields: {
                // Calculate how close the product's price is to the user's average spending power
                priceDistance: { $abs: { $subtract: ["$price", avgPriceTier] } }
            }
        },
        { 
            // Sort by items closest to their budget, then by newest arrivals
            $sort: { 
                priceDistance: 1, 
                createdAt: -1 
            } 
        },
        { $limit: limit }
    ]);

    // FALLBACK 2: If we didn't find enough matching items, pad the array with random unseen items
    if (dynamicRecommendations.length < limit) {
        const filledIds = dynamicRecommendations.map(p => p._id);
        const paddingItems = await Product.find({
            _id: { $nin: [...interactedProductIds, ...filledIds] }
        }).limit(limit - dynamicRecommendations.length);

        // Merge standard mongoose documents into our aggregation array
        dynamicRecommendations.push(...paddingItems.map(doc => doc.toObject()));
    }

    return res.status(200).json(
        new ApiResponse(200, dynamicRecommendations, "Personalized recommendations generated successfully")
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