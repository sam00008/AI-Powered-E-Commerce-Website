import { Router } from "express";
import { verifyjwt } from "../middleware/auth.middleware.js";
import { verifyAdmin } from "../middleware/admin.auth.middleware.js";
import {
  cancelOrder,
  getOrderDetails,
  getOrderHistory,
  placeOrder,
  updateOrderStatus,
  adminGetAllOrders,
  adminDeleteOrder,
  placeOrderRazorPay,
} from "../controller/order.controller.js";

const router = Router();

//  User Routes (Require JWT)
router.post("/place", verifyjwt, placeOrder);
router.get("/history", verifyjwt, getOrderHistory);
router.get("/details/:orderId", verifyjwt, getOrderDetails);
router.put("/cancel/:orderId", verifyjwt, cancelOrder);
router.post("/place/razorpay", verifyjwt, placeOrderRazorPay);

// Admin Routes
router.put("/status/:orderId",verifyjwt, updateOrderStatus);
router.get("/admin/list",verifyjwt, adminGetAllOrders);
router.delete("/admin/delete/:orderId",verifyAdmin, adminDeleteOrder);

export default router;
