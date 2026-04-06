import { asyncHandler } from "../utils/async-handler.js";
import uploadOnCloudinary from "../config/cloudinary.js";
import Product from "../model/productModel.js";
import { ApiError } from "../utils/api_Error.js";
import { ApiResponse } from "../utils/api_Response.js";
import UserActivity from "../model/userActivityModel.js";
import fs from "fs/promises";

// =====================================================
// 🟢 ADD PRODUCT
// =====================================================
const addProduct = asyncHandler(async (req, res) => {
    const {
        name,
        description,
        price,
        category,
        subCategory,
        brand,
        type,
        bestSeller,
        tags
    } = req.body;

    if (!name || !description || !price || !category || !subCategory) {
        throw new ApiError(400, "All required fields must be filled");
    }

    if (!req.files || !req.files.image1 || !req.files.image2 || !req.files.image3 || !req.files.image4) {
        throw new ApiError(400, "All four images are required");
    }

    const imagePaths = [
        req.files.image1[0].path,
        req.files.image2[0].path,
        req.files.image3[0].path,
        req.files.image4[0].path,
    ];

    try {
        // ✅ Upload images to Cloudinary
        const uploads = await Promise.all(
            imagePaths.map((path) => uploadOnCloudinary(path))
        );

        // ✅ Verify all uploads were successful
        const failedUploads = uploads.filter((upload) => !upload);
        if (failedUploads.length > 0) {
            throw new ApiError(500, "Failed to upload one or more images to Cloudinary");
        }

        // ✅ Delete local temp files ONLY AFTER successful Cloudinary upload
        await Promise.all(
            imagePaths.map((path) => fs.unlink(path).catch(() => console.log(`Failed to delete temp file: ${path}`)))
        );

        // ✅ TAG PARSING
        let parsedTags = [];
        if (tags) {
            if (typeof tags === "string") {
                parsedTags = tags
                    .split(",")
                    .map((t) => t.trim())
                    .filter((t) => t.length > 0);
            } else if (Array.isArray(tags)) {
                parsedTags = tags;
            }
        }

        const product = await Product.create({
            name,
            description,
            price: Number(price),
            category,
            subCategory,
            brand: brand?.trim() || "",
            type: type?.trim() || "",
            bestSeller: bestSeller === "true" || bestSeller === true,
            tags: parsedTags,

            // ✅ FIXED: Safely check for both `url` and `secure_url`
            image1: uploads[0]?.url || uploads[0]?.secure_url,
            image2: uploads[1]?.url || uploads[1]?.secure_url,
            image3: uploads[2]?.url || uploads[2]?.secure_url,
            image4: uploads[3]?.url || uploads[3]?.secure_url,
        });

        return res.status(201).json(
            new ApiResponse(201, product, "Product added successfully")
        );

    } catch (error) {
        console.error("UPLOAD ERROR:", error);
        
        // Safety cleanup: Ensure temp files are deleted even if upload/DB creation fails
        await Promise.all(
            imagePaths.map((path) => fs.unlink(path).catch(() => {}))
        );

        throw new ApiError(500, error.message || "Error uploading product images");
    }
});

// =====================================================
// 📦 LIST PRODUCTS
// =====================================================
const listProduct = asyncHandler(async (req, res) => {
    const products = await Product.find({}).sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, products, "Products fetched successfully")
    );
});


// =====================================================
// ❌ REMOVE PRODUCT
// =====================================================
const removeProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) throw new ApiError(400, "Product ID required");

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    return res.status(200).json(
        new ApiResponse(200, null, "Product deleted successfully")
    );
});


// =====================================================
// ✏️ UPDATE PRODUCT
// =====================================================
const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const {
        name,
        description,
        price,
        category,
        subCategory,
        brand,
        type,
        bestSeller,
        tags
    } = req.body;

    const product = await Product.findById(id);
    if (!product) throw new ApiError(404, "Product not found");

    const updatedImages = {};
    const cleanupPaths = [];

    if (req.files) {
        const keys = ["image1", "image2", "image3", "image4"];

        await Promise.all(
            keys.map(async (key) => {
                if (req.files[key]) {
                    const path = req.files[key][0].path;
                    cleanupPaths.push(path);

                    const result = await uploadOnCloudinary(path);
                    if (result) {
                        updatedImages[key] = result.url || result.secure_url;
                    }
                }
            })
        );
    }

    // ✅ Delete temp files
    await Promise.all(
        cleanupPaths.map((path) => fs.unlink(path).catch(() => {}))
    );

    // ✅ TAG PARSING
    let parsedTags;
    if (tags !== undefined) {
        if (typeof tags === "string") {
            parsedTags = tags
                .split(",")
                .map((t) => t.trim())
                .filter((t) => t.length > 0);
        } else if (Array.isArray(tags)) {
            parsedTags = tags;
        } else {
            parsedTags = [];
        }
    }

    const updateData = {
        ...(name && { name }),
        ...(description && { description }),
        ...(price && { price: Number(price) }),
        ...(category && { category }),
        ...(subCategory && { subCategory }),
        ...(brand && { brand }),
        ...(type && { type }),
        ...(bestSeller !== undefined && {
            bestSeller: bestSeller === "true" || bestSeller === true
        }),
        ...(parsedTags !== undefined && { tags: parsedTags }),
        ...updatedImages,
    };

    const updatedProduct = await Product.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
    );

    return res.status(200).json(
        new ApiResponse(200, updatedProduct, "Product updated successfully")
    );
});


// =====================================================
// 🔍 GET SINGLE PRODUCT
// =====================================================
const getProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) throw new ApiError(404, "Product not found");

    // ✅ Track user activity
    if (req.user?._id) {
        await UserActivity.findOneAndUpdate(
            {
                userId: req.user._id,
                productId: id,
                action: "view",
            },
            { $inc: { weight: 0.2 } },
            { upsert: true }
        );
    }

    return res.status(200).json(
        new ApiResponse(200, product, "Product fetched successfully")
    );
});


// =====================================================
// 🔎 SEARCH PRODUCT (UPDATED WITH TAGS)
// =====================================================
const searchProduct = asyncHandler(async (req, res) => {
    const query = req.query.query?.trim();

    if (!query) {
        return res.status(200).json(
            new ApiResponse(200, [], "Enter search keyword")
        );
    }

    const keywords = query.split(" ").filter(Boolean);

    const filter = {
        $and: keywords.map((word) => {
            const regex = new RegExp(word, "i");

            return {
                $or: [
                    { name: regex },
                    { description: regex },
                    { category: regex },
                    { subCategory: regex },
                    { brand: regex },
                    { type: regex },
                    { tags: regex }, // ✅ VERY IMPORTANT
                ],
            };
        }),
    };

    const products = await Product.find(filter);

    return res.status(200).json(
        new ApiResponse(200, products, "Search results fetched")
    );
});


// =====================================================
// EXPORTS
// =====================================================
export {
    addProduct,
    listProduct,
    removeProduct,
    updateProduct,
    getProduct,
    searchProduct,
};