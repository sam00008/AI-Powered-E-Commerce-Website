import { Router } from "express";
import upload from "../middleware/muter.middleware.js";
import { addProduct, getProduct, listProduct, removeProduct, searchProduct, updateProduct } from "../controller/product.controller.js";

const router = Router();

router.route("/addproduct").post(
    upload.fields([
        {name: "image1", maxCount: 1},
        {name: "image2", maxCount: 1},
        {name: "image3", maxCount: 1},
        {name: "image4", maxCount: 1},
    ]),
    addProduct
);

router.route("/admin/list").get(listProduct);
router.route("/product/:id").delete(removeProduct);
router.route("/product/:id").put(
    upload.fields([
        { name: "image1", maxCount: 1 },
        { name: "image2", maxCount: 1 },
        { name: "image3", maxCount: 1 },
        { name: "image4", maxCount: 1 },
    ]),
    updateProduct
);
router.route("/category/:id").get(getProduct);
router.route("/search").get(searchProduct);



 export default router;