import { Router } from "express";
import { verifyjwt } from "../middleware/auth.middleware.js";
import {
  cancelOrder,
  getOrderDetails,
  getOrderHistory,
  placeOrder,
  updateOrderStatus,
  adminGetAllOrders,
  adminDeleteOrder,
  placeOrderRazorPay
} from "../controller/order.controller.js";

const router = Router();

// 🛒 User Routes (Require JWT)
router.post("/place", verifyjwt, placeOrder);
router.route("/history").get(verifyjwt, getOrderHistory);
router.get("/details/:orderId", verifyjwt, getOrderDetails);
router.put("/cancel/:orderId", verifyjwt, cancelOrder);
router.put("/cancel/:orderId", verifyjwt, cancelOrder);
router.post("/place/razorpay", verifyjwt, placeOrderRazorPay);
// 🧑‍💼 Admin Routes (Public - No JWT required)
router.put("/status/:orderId", updateOrderStatus);
router.get("/admin/list", adminGetAllOrders);
router.delete("/admin/delete/:orderId", adminDeleteOrder);

export default router;
