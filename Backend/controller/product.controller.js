import { asyncHandler } from "../utils/async-handler.js";
import uploadOnCloudinary from "../config/cloudinary.js";
import Product from "../model/productModel.js";
import { ApiError } from "../utils/api_Error.js";
import { ApiResponse } from "../utils/api_Response.js";
import fs from "fs/promises";

// -----------------------------------------------------------
// 1. ADD PRODUCT
// -----------------------------------------------------------
const addProduct = asyncHandler(async (req, res) => {
    // NOTE: This function is correct and robust, no significant changes needed.
    const { name, description, price, category, subCategory, brand, type, bestSeller } = req.body;

    // 1️⃣ Validate required fields
    if (!name || !description || !price || !category || !subCategory) {
        throw new ApiError(400, "All required fields must be filled"); // 👈 Use throw new ApiError for consistency
    }

    // 2️⃣ Validate images
    if (!req.files || !req.files.image1 || !req.files.image2 || !req.files.image3 || !req.files.image4) {
        throw new ApiError(400, "All four images are required"); // 👈 Use throw new ApiError for consistency
    }

    try {
        // 3️⃣ Upload all images to Cloudinary in parallel
        const imagePaths = [
            req.files.image1[0].path,
            req.files.image2[0].path,
            req.files.image3[0].path,
            req.files.image4[0].path,
        ];

        const [image1, image2, image3, image4] = await Promise.all(
            imagePaths.map((path) => uploadOnCloudinary(path))
        );

        // 4️⃣ Cleanup local temporary files
        // NOTE: The try/catch around unlink is good practice for robust cleanup
        for (const path of imagePaths) {
            try { await fs.unlink(path); } catch (err) { console.warn("Failed to delete temp file:", path, err.message); }
        }

        // 5️⃣ Build product data
        const productData = {
            name,
            description,
            price: Number(price),
            category,
            subCategory,
            brand: brand?.trim() || "",
            type: type?.trim() || "",
            // FIX: Ensure bestSeller parsing handles undefined/null from the form
            bestSeller: (bestSeller === "true" || bestSeller === true), 
            image1: image1.url, // 👈 FIX: Must use image1.url if uploadOnCloudinary returns an object
            image2: image2.url,
            image3: image3.url,
            image4: image4.url,
        };

        // 6️⃣ Save product
        const product = await Product.create(productData);

        // 7️⃣ Response
        return res
            .status(201) // 👈 Status 201 for resource creation
            .json(new ApiResponse(201, product, "Product added successfully"));
    } catch (error) {
        console.error("Error adding product:", error);
        // Clean up any files that were partially uploaded if the process failed
        // (This is advanced, but good to remember. For now, rely on API error).
        throw new ApiError(500, error.message || "Error adding product and uploading files");
    }
});

// -----------------------------------------------------------
// 2. LIST PRODUCT (Admin endpoint)
// -----------------------------------------------------------
const listProduct = asyncHandler(async (req,res) => {
    const products = await Product.find({}); // 👈 Renamed variable to plural for clarity
    
    // ❌ FIX: ApiError should be thrown, not returned.
    if(!products || products.length === 0){
        throw new ApiError(404, "No Products Found");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            products, // 👈 Use plural variable
            "Products fetched successfully"
        )
    )
});

// -----------------------------------------------------------
// 3. REMOVE PRODUCT
// -----------------------------------------------------------
const removeProduct = asyncHandler(async(req,res) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    
    // ❌ FIX: Throw ApiError instead of returning it
    if(!product){
        throw new ApiError(404, "Product not found");
    }

    // ✅ Use findByIdAndDelete which is cleaner
    await Product.findByIdAndDelete(id); 

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            null,
            "Product Deleted successfully"
        )
    )
});

// -----------------------------------------------------------
// 4. UPDATE PRODUCT
// -----------------------------------------------------------
const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    // NOTE: Removed 'sizes' from destructuring since it was not used correctly
    const { name, description, price, category, subCategory, brand, type, bestseller } = req.body;

    // 1️⃣ Find product and handle not found
    const product = await Product.findById(id);
    if (!product) {
        throw new ApiError(404, "Product not found"); // 👈 Status 404 is better for resource not found
    }

    // 2️⃣ Handle image uploads (Parallel processing and cleanup are correct)
    const updatedImages = {};
    const cleanupPaths = []; // 👈 Array to track files for cleanup
    
    if (req.files) {
        const imageKeys = ["image1", "image2", "image3", "image4"];
        const uploadPromises = [];

        for (const key of imageKeys) {
            if (req.files[key]) {
                const path = req.files[key][0].path;
                cleanupPaths.push(path); // Track path for final cleanup
                
                uploadPromises.push(
                    // FIX: Ensure we extract the URL correctly
                    uploadOnCloudinary(path).then((result) => {
                        updatedImages[key] = result.url; // Assuming result is { url, public_id }
                    })
                );
            }
        }
        await Promise.all(uploadPromises);
    }

    // 3️⃣ Cleanup local files
    for (const path of cleanupPaths) {
        try { await fs.unlink(path); } catch (err) { console.warn("Failed to delete temp file during update cleanup:", path, err.message); }
    }

    // 4️⃣ Build update data
    const updateData = {
        ...(name && { name }),
        ...(description && { description }),
        ...(price && { price: Number(price) }),
        ...(category && { category }),
        ...(subCategory && { subCategory }),
        ...(brand && { brand }), // Use brand from req.body if present
        ...(type && { type }),   // Use type from req.body if present
        // FIX: The field name used in addProduct was 'bestSeller' (capital S) - maintain consistency
        ...(bestseller !== undefined && { bestSeller: bestseller === "true" }), 
        ...updatedImages,
    };

    // 5️⃣ Update and return
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });

    return res.status(200).json(
        new ApiResponse(200, updatedProduct, "Product Updated successfully")
    );
});


// -----------------------------------------------------------
// 5. GET PRODUCT (Single product by ID)
// -----------------------------------------------------------
const getProduct = asyncHandler(async (req,res) => {
    const { id } = req.params;
    const product = await Product.findById(id);

    // ❌ FIX: Throw ApiError instead of returning it
    if(!product){
        throw new ApiError(404, "Product not found");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            product,
            "Product detail Successfully fetched"
        )
    )
});


// -----------------------------------------------------------
// 6. SEARCH PRODUCT
// -----------------------------------------------------------
const searchProduct = asyncHandler(async (req, res) => {
    const query = req.query.query ? req.query.query.trim() : "";

    // ❌ FIX: Use ApiError/ApiResponse consistency
    if (!query) {
        return res.status(200).json(new ApiResponse(200, [], "Please enter a search term"));
    }

    // 1. Split the search query into individual keywords
    const keywords = query
        .split(" ")
        .filter(k => k.trim() !== "");

    // 2. Create a search condition for EACH keyword (MongoDB $or and $and)
    const regexConditions = keywords.map(keyword => {
        const regex = new RegExp(keyword, "i");
        return {
            $or: [
                { name: regex },
                { category: regex },
                { description: regex },
                { brand: regex },
                { subCategory: regex }, // Added subCategory for better search
                { type: regex }
            ]
        };
    });

    // 3. Build the final filter: Product must match ALL keywords
    const filter = {
        $and: regexConditions
    };

    const products = await Product.find(filter);

    if (!products || products.length === 0) {
        // ❌ FIX: Use ApiError/ApiResponse consistency
        throw new ApiError(404, "No Product Found matching search criteria");
    }

    return res.status(200).json(
        new ApiResponse(200, products, "Products Successfully Fetched")
    );
});


export { 
    addProduct,
    listProduct,
    removeProduct,
    updateProduct,
    getProduct,
    searchProduct
};