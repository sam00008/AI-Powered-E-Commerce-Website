import { Router } from "express";
import upload from "../middleware/muter.middleware.js";
import { verifyjwt } from "../middleware/auth.middleware.js";
import { 
    addProduct, 
    getProduct, 
    listProduct, 
    removeProduct, 
    searchProduct, 
    updateProduct 
} from "../controller/product.controller.js";

const router = Router();

// =======================================================
// 1. Static and Specific Routes (MUST COME FIRST)
// =======================================================

// Search Route (Specific static path)
router.route("/search").get(searchProduct);

// Admin List (Specific static path, protected)
router.route("/admin/list").get(verifyjwt, listProduct);

// Add Product (Specific static path, protected)
router.route("/addproduct").post(
    verifyjwt,
    upload.fields([
        {name: "image1", maxCount: 1},
        {name: "image2", maxCount: 1},
        {name: "image3", maxCount: 1},
        {name: "image4", maxCount: 1},
    ]),
    addProduct
);

// Get Product by Category ID (Specific dynamic path)
router.route("/category/:id").get(getProduct);

// =======================================================
// 2. Generic Dynamic Routes (MUST COME LAST)
// =======================================================

// Delete Product by ID (Generic dynamic path, protected)
router.route("/:id").delete(verifyjwt, removeProduct);

// Update Product by ID (Generic dynamic path, protected)
router.route("/:id").put(
    verifyjwt,
    upload.fields([
        { name: "image1", maxCount: 1 },
        { name: "image2", maxCount: 1 },
        { name: "image3", maxCount: 1 },
        { name: "image4", maxCount: 1 },
    ]),
    updateProduct
);

// NOTE: You are missing a GET route for a single product by ID, 
// which typically uses the /:id path, but you might handle it with /category/:id.

export default router;