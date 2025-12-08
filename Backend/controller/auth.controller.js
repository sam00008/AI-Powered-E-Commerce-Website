import { ApiResponse } from "../utils/api_Response.js";
import { ApiError } from "../utils/api_Error.js";    
import { asyncHandler } from "../utils/async-handler.js";
import { forgotPasswordMailgenContent, sendEmail } from "../utils/mail.js";
import validator from "validator";
import User from "../model/userModel.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import ms from "ms";

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
};

const generateAccessAndRefreshToken = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(500, "User not found during token generation.");

    const accessToken = jwt.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
    const refreshToken = jwt.sign({ _id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY });

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
};

// --- REGISTER USER ---
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) return res.status(400).json({ message: "All fields required" });
    if (!validator.isEmail(email)) return res.status(400).json({ message: "Invalid email" });

    if (await User.findOne({ email })) return res.status(409).json({ message: "User already exists" });

    const user = await User.create({ name, email, password });
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    res.cookie("accessToken", accessToken, { ...cookieOptions, maxAge: ms(process.env.ACCESS_TOKEN_EXPIRY) });
    res.cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: ms(process.env.REFRESH_TOKEN_EXPIRY) });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    return res.status(201).json(new ApiResponse(201, { user: createdUser }, "User registered successfully"));
});

// --- LOGIN USER ---
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials: User not found" });

    const isMatch = await user.isPasswordCorrect(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials: Password incorrect" });

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    res.cookie("accessToken", accessToken, { ...cookieOptions, maxAge: ms(process.env.ACCESS_TOKEN_EXPIRY) });
    res.cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: ms(process.env.REFRESH_TOKEN_EXPIRY) });

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    return res.status(200).json(new ApiResponse(200, { user: loggedInUser }, "Login successful"));
});

// --- REFRESH ACCESS TOKEN ---
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken;

    if (!incomingRefreshToken) {
        res.clearCookie("accessToken", cookieOptions);
        res.clearCookie("refreshToken", cookieOptions);
        return res.status(401).json({ message: "Refresh token not found" });
    }

    try {
        const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decoded._id);

        if (!user || user.refreshToken !== incomingRefreshToken) {
            res.clearCookie("accessToken", cookieOptions);
            res.clearCookie("refreshToken", cookieOptions);
            return res.status(401).json({ message: "Invalid refresh token" });
        }

        const newAccessToken = jwt.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
        res.cookie("accessToken", newAccessToken, { ...cookieOptions, maxAge: ms(process.env.ACCESS_TOKEN_EXPIRY) });

        return res.status(200).json(new ApiResponse(200, { accessToken: newAccessToken }, "New access token generated"));
    } catch (error) {
        res.clearCookie("accessToken", cookieOptions);
        res.clearCookie("refreshToken", cookieOptions);
        return res.status(401).json({ message: "Invalid or expired refresh token" });
    }
});

// --- LOGOUT USER ---
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, { $set: { refreshToken: null } }, { new: true });

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    return res.status(200).json(new ApiResponse(200, {}, "User logged out successfully"));
});

// --- GET CURRENT USER ---
const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password -refreshToken");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json(new ApiResponse(200, { user }, "Current user fetched"));
});

// --- FORGET PASSWORD ---
const forgetPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email || !validator.isEmail(email)) return res.status(400).json({ message: "Invalid email" });

    const user = await User.findOne({ email });
    if (!user) return res.status(200).json(new ApiResponse(200, {}, "If a user exists, a password reset email has been sent."));

    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();
    user.forgotPasswordToken = hashedToken;
    user.forgotPasswordExpiry = tokenExpiry;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`;
    await sendEmail({ email: user.email, subject: "Reset your Password", mailgenContent: forgotPasswordMailgenContent(user.name, resetUrl) });

    return res.status(200).json(new ApiResponse(200, {}, "Password reset mail sent successfully"));
});

// --- RESET FORGOT PASSWORD ---
const resetForgotPassword = asyncHandler(async (req, res) => {
    const { resetToken } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) return res.status(400).json({ message: "New password required" });

    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    const user = await User.findOne({ forgotPasswordToken: hashedToken, forgotPasswordExpiry: { $gt: Date.now() } });

    if (!user) return res.status(401).json({ message: "Token invalid or expired" });
    if (newPassword.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });

    user.password = newPassword;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save();

    return res.status(200).json(new ApiResponse(200, {}, "Password reset successfully"));
});

// --- ADMIN LOGIN ---
const adminLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const adminEmail = process.env.ADMIN_LOGIN_EMAIL;
    const adminPassword = process.env.ADMIN_LOGIN_PASSWORD;

    if (adminEmail !== email || adminPassword !== password) return res.status(401).json({ message: "Invalid admin credentials" });

    const token = jwt.sign({ email, role: "admin" }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "7d" });
    res.cookie("accessToken", token, { ...cookieOptions, maxAge: ms("7d") });

    return res.status(200).json(new ApiResponse(200, { adminEmail: email, accessToken: token }, "Admin login successful"));
});

// --- CURRENT ADMIN ---
const currentAdmin = asyncHandler(async (req, res) => {
    const token = req.cookies?.accessToken;
    if (!token) return res.status(401).json({ message: "No admin token provided" });

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (decoded.email !== process.env.ADMIN_LOGIN_EMAIL) return res.status(403).json({ message: "Token belongs to non-admin" });

        return res.status(200).json(new ApiResponse(200, { email: decoded.email, role: decoded.role || "admin" }, "Current admin fetched successfully"));
    } catch {
        res.clearCookie("accessToken", cookieOptions);
        return res.status(401).json({ message: "Invalid or expired admin token" });
    }
});

// --- ADMIN LOGOUT ---
const adminLogout = asyncHandler(async (req, res) => {
    res.clearCookie("accessToken", cookieOptions);
    return res.status(200).json(new ApiResponse(200, {}, "Admin successfully logged out"));
});

export {
    registerUser,
    loginUser,
    logoutUser,
    forgetPassword,
    resetForgotPassword,
    getCurrentUser,
    adminLogin,
    currentAdmin,
    adminLogout,
    refreshAccessToken
};
