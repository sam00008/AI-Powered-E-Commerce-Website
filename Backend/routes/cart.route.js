import { verify } from "crypto";
import { Router } from "express";
import { verifyjwt } from "../middleware/auth.middleware.js";
import { addToCart, clearCart, getCart, removeItem, updateCart } from "../controller/cart.controller.js";

const router = Router();

router.route("/addcart").post(verifyjwt,addToCart);
router.route("/").get(verifyjwt,getCart);
router.route("/update").put(verifyjwt,updateCart);
router.route("/remove").delete(verifyjwt,removeItem);
router.route("/clear").delete(verifyjwt,clearCart);

export default router;