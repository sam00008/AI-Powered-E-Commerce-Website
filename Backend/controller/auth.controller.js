import { ApiResponse } from "../utils/api_Response.js";
import { ApiError } from "../utils/api_Error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { forgotPasswordMailgenContent, sendEmail } from "../utils/mail.js";
import validator from "validator";
import User from "../model/userModel.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import ms from "ms";

// UNIVERSAL COOKIE SETTINGS
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", 
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
};

// ------------------------ TOKEN GENERATOR ------------------------
const generateAccessAndRefreshToken = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(500, "User not found during token generation.");

    const accessToken = jwt.sign(
        { _id: user._id }, 
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = jwt.sign(
        { _id: user._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
};

// ----------------------------- REGISTER -----------------------------
export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
        return res.status(400).json({ message: "All fields required" });

    if (!validator.isEmail(email))
        return res.status(400).json({ message: "Invalid email" });

    if (await User.findOne({ email }))
        return res.status(409).json({ message: "User already exists" });

    const user = await User.create({ name, email, password });

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    res.cookie("accessToken", accessToken, {
        ...cookieOptions,
        maxAge: ms(process.env.ACCESS_TOKEN_EXPIRY),
    });

    res.cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: ms(process.env.REFRESH_TOKEN_EXPIRY),
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    return res.status(201).json(
        new ApiResponse(201, { user: createdUser }, "User registered successfully")
    );
});

// ----------------------------- LOGIN -----------------------------
export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res.status(400).json({ message: "Email & password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const isMatch = await user.isPasswordCorrect(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    res.cookie("accessToken", accessToken, {
        ...cookieOptions,
        maxAge: ms(process.env.ACCESS_TOKEN_EXPIRY),
    });

    res.cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: ms(process.env.REFRESH_TOKEN_EXPIRY),
    });

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(200, { user: loggedInUser }, "Login successful")
    );
});

// ----------------------------- REFRESH TOKEN -----------------------------
export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken;

    if (!incomingRefreshToken) {
        res.clearCookie("accessToken", cookieOptions);
        res.clearCookie("refreshToken", cookieOptions);
        return res.status(401).json({ message: "No refresh token" });
    }

    try {
        const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decoded._id);

        if (!user || user.refreshToken !== incomingRefreshToken) {
            res.clearCookie("accessToken", cookieOptions);
            res.clearCookie("refreshToken", cookieOptions);
            return res.status(401).json({ message: "Invalid refresh token" });
        }

        const newAccessToken = jwt.sign(
            { _id: user._id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
        );

        res.cookie("accessToken", newAccessToken, {
            ...cookieOptions,
            maxAge: ms(process.env.ACCESS_TOKEN_EXPIRY),
        });

        return res.status(200).json(
            new ApiResponse(200, { accessToken: newAccessToken }, "Token refreshed")
        );
    } catch (error) {
        res.clearCookie("accessToken", cookieOptions);
        res.clearCookie("refreshToken", cookieOptions);
        return res.status(401).json({ message: "Expired refresh token" });
    }
});

// ----------------------------- LOGOUT -----------------------------
export const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    return res.status(200).json(
        new ApiResponse(200, {}, "User logged out successfully")
    );
});

// ----------------------------- CURRENT USER -----------------------------
export const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password -refreshToken");
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json(new ApiResponse(200, { user }, "User fetched"));
});

// ----------------------------- FORGOT PASSWORD -----------------------------
export const forgetPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email || !validator.isEmail(email))
        return res.status(400).json({ message: "Invalid email" });

    const user = await User.findOne({ email });

    if (!user)
        return res.status(200).json(new ApiResponse(200, {}, "Email sent if user exists"));

    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();

    user.forgotPasswordToken = hashedToken;
    user.forgotPasswordExpiry = tokenExpiry;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`;

    await sendEmail({
        email: user.email,
        subject: "Reset your Password",
        mailgenContent: forgotPasswordMailgenContent(user.name, resetUrl),
    });

    return res.status(200).json(
        new ApiResponse(200, {}, "Password reset link sent")
    );
});

// ----------------------------- RESET PASSWORD -----------------------------
export const resetForgotPassword = asyncHandler(async (req, res) => {
    const { resetToken } = req.params;
    const { newPassword } = req.body;

    if (!newPassword)
        return res.status(400).json({ message: "New password required" });

    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    const user = await User.findOne({
        forgotPasswordToken: hashedToken,
        forgotPasswordExpiry: { $gt: Date.now() },
    });

    if (!user)
        return res.status(401).json({ message: "Token expired or invalid" });

    user.password = newPassword;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save();

    return res.status(200).json(new ApiResponse(200, {}, "Password reset successful"));
});

// ----------------------------- ADMIN LOGIN -----------------------------
export const adminLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const adminEmail = process.env.ADMIN_LOGIN_EMAIL;
    const adminPassword = process.env.ADMIN_LOGIN_PASSWORD;

    if (email !== adminEmail || password !== adminPassword) {
        return res.status(401).json({ status: 401, message: "Invalid admin credentials" });
    }

    const token = jwt.sign(
        { email, role: "admin" },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "7d" }
    );

    res.cookie("accessToken", token, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
        status: 200,
        message: "Admin login successful",
        data: { email, role: "admin" },
    });
});

// ----------------------------- CURRENT ADMIN -----------------------------
export const currentAdmin = asyncHandler(async (req, res) => {
    const token = req.cookies?.accessToken;

    if (!token) return res.status(401).json({ status: 401, message: "Not authenticated" });

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        return res.status(200).json({
            status: 200,
            data: decoded,
        });
    } catch {
        return res.status(401).json({ status: 401, message: "Invalid or expired token" });
    }
});

// ----------------------------- ADMIN LOGOUT -----------------------------
export const adminLogout = asyncHandler(async (req, res) => {
    res.clearCookie("accessToken", cookieOptions);

    return res.status(200).json({
        status: 200,
        message: "Logged out successfully",
    });
});
