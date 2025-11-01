// controller/product.controller.js
import { asyncHandler } from "../utils/async-handler.js";
import uploadOnCloudinary from "../config/cloudinary.js";
import Product from "../model/productModel.js";
import { ApiError } from "../utils/api_Error.js";
import { ApiResponse } from "../utils/api_Response.js";
import fs from "fs/promises";

const addProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, subCategory, brand, type, bestSeller } = req.body;

  // 1️⃣ Validate required fields
  if (!name || !description || !price || !category || !subCategory) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "All required fields must be filled"));
  }

  // 2️⃣ Validate images
  if (
    !req.files ||
    !req.files.image1 ||
    !req.files.image2 ||
    !req.files.image3 ||
    !req.files.image4
  ) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "All four images are required"));
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
    for (const path of imagePaths) {
      try {
        await fs.unlink(path);
      } catch (err) {
        console.warn("Failed to delete temp file:", path, err.message);
      }
    }

    // 5️⃣ Build product data
    const productData = {
      name,
      description,
      price: Number(price),
      category,
      subCategory,
      brand: brand?.trim() || "",   // optional
      type: type?.trim() || "",     // optional
      bestSeller: bestSeller === "true", // convert from string to boolean
      image1,
      image2,
      image3,
      image4,
    };

    // 6️⃣ Save product
    const product = await Product.create(productData);

    // 7️⃣ Response
    return res
      .status(200)
      .json(new ApiResponse(200, product, "Product added successfully"));
  } catch (error) {
    console.error("Error adding product:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error"));
  }
});

const listProduct = asyncHandler(async(req,res) => {
  const product = await Product.find({});
  if(!product || product.length === 0){
    return new ApiError(400,"Product not Exist");
  }

  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      product,
      "Product fetched successfully"
    )
  )
});

const removeProduct = asyncHandler(async(req,res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if(!product){
     throw new ApiError(400,"Product not found");
  }

  await product.deleteOne();
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

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, subCategory, sizes, bestseller } = req.body;

  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(401, "Product not found");
  }

  try {
    // Handle image uploads
    const updatedImages = {};
    if (req.files) {
      const imageKeys = ["image1", "image2", "image3", "image4"];
      const uploadPromises = [];

      for (const key of imageKeys) {
        if (req.files[key]) {
          const path = req.files[key][0].path;
          uploadPromises.push(
            uploadOnCloudinary(path).then((url) => {
              updatedImages[key] = url;
              return fs.unlink(path);
            })
          );
        }
      }

      await Promise.all(uploadPromises);
    }

    // ✅ Fix sizes handling: store as string or array if needed
    let parsedSizes = sizes;
    if (sizes) {
      try {
        parsedSizes = JSON.parse(sizes); // only if it's JSON array
      } catch {
        parsedSizes = sizes; // fallback to string like "XL"
      }
    }

    const updateData = {
      ...(name && { name }),
      ...(description && { description }),
      ...(price && { price: Number(price) }),
      ...(category && { category }),
      ...(subCategory && { subCategory }),
      ...(sizes && { sizes: parsedSizes }),
      ...(bestseller !== undefined && { bestseller: bestseller === "true" }),
      ...updatedImages,
    };

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });

    return res.status(200).json(
      new ApiResponse(200, updatedProduct, "Product Updated successfully")
    );
  } catch (error) {
    console.error("Error updating product:", error);
    throw new ApiError(500, "Error updating product");
  }
});

const getProduct = asyncHandler(async (req,res) => {
  const { id } = req.params;
  const product = await Product.findById(id);

  if(!product){
    throw new ApiError(401,"Product not found");
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

const searchProduct = asyncHandler(async (req, res) => {
  try {
    const query = req.query.query ? req.query.query.trim() : "";

    // 1. Split the search query into individual keywords
    const keywords = query
      .split(" ")
      .filter(k => k.trim() !== ""); // e.g., "women t-shirt" -> ["women", "t-shirt"]

    // If there's no query, return no products
    if (keywords.length === 0) {
      return res.status(200).json({
        status: 200,
        data: [],
        message: "Please enter a search term",
      });
    }

    // 2. Create a search condition for EACH keyword
    // We will search across multiple fields for each keyword
    const regexConditions = keywords.map(keyword => {
      const regex = new RegExp(keyword, "i"); // Case-insensitive regex
      return {
        $or: [
          { name: regex },
          { category: regex },
          { description: regex },
          { brand: regex },
          { type: regex } // Add any other fields you want to search
        ]
      };
    });

    // 3. Build the final filter
    // We use $and to ensure the product matches ALL keywords
    const filter = {
      $and: regexConditions
    };

    console.log("Filter being used:", JSON.stringify(filter, null, 2));

    const products = await Product.find(filter);

    if (!products || products.length === 0) {
      return res.status(404).json({
        status: 404,
        data: [],
        message: "No Product Found",
      });
    }

    return res.status(200).json({
      status: 200,
      data: products,
      message: "Products Successfully Fetched",
    });

  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ status: 500, message: "Server Error" });
  }
});




export { 
  addProduct,
  listProduct,
  removeProduct,
  updateProduct,
  getProduct,
  searchProduct
 };
