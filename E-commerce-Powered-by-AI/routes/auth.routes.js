import { Router } from "express";
import { loginUser, logoutUser, registerUser,forgetPassword, resetForgotPassword, getCurrentUser, adminLogin } from "../controller/auth.controller.js";
import { verifyjwt } from "../middleware/auth.middleware.js";
const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyjwt,logoutUser );
router.route("/forgot-password").post(forgetPassword);
router.route("/reset-password/:resetToken").post(resetForgotPassword);
router.route("/current-user").get(verifyjwt,getCurrentUser);
router.route("/admin/login").post(adminLogin);
export default router;