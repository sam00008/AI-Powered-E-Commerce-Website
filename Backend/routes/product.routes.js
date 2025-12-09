import { Router } from "express";
import upload from "../middleware/muter.middleware.js";
import { verifyjwt } from "../middleware/auth.middleware.js";
import { addProduct, getProduct, listProduct, removeProduct, searchProduct, updateProduct } from "../controller/product.controller.js";

const router = Router();

router.route("/addproduct").post(verifyjwt,
    upload.fields([
        {name: "image1", maxCount: 1},
        {name: "image2", maxCount: 1},
        {name: "image3", maxCount: 1},
        {name: "image4", maxCount: 1},
    ]),
    addProduct
);

router.route("/admin/list").get(verifyjwt,listProduct);
router.route("/:id").delete(verifyjwt,removeProduct);
router.route("/:id").put(
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