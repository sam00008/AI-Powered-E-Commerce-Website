import { ApiResponse } from "../utils/api_Response.js";
import { ApiError } from "../utils/api_Error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { forgotPasswordMailgenContent, sendEmail } from "../utils/mail.js";
import validator from "validator";
import User from "../model/userModel.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import ms from "ms";

// --- GLOBAL COOKIE UTILITY DEFINITION ---

/**
 * Standard cookie options for setting JWT tokens securely in the browser.
 * NOTE: For development across different ports (e.g., React on 5173, Node on 3000/5000), 
 * 'secure: false' and 'sameSite: "None"' are often required for local testing 
 * with plain HTTP, but this is a security risk in a real setup.
 */
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false,
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
};

/**
 * Generates a new Access Token and a Refresh Token for a given user ID
 * and updates the user's document in the database with the new Refresh Token.
 * @param {string} userId - The unique identifier of the user (User._id).
 */
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            // Use ApiError for better consistency, though it's an internal error here
            throw new ApiError(500, "User not found during token generation.");
        }

        // 1. Generate Access Token
        const accessToken = jwt.sign(
            { _id: user._id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
        );

        // 2. Generate Refresh Token
        const refreshToken = jwt.sign(
            { _id: user._id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
        );

        // 3. Save the new Refresh Token to the user document
        user.refreshToken = refreshToken;
        // Bypassing validation is appropriate here since only refreshToken is changed
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        // Log error and re-throw an ApiError for asyncHandler to handle
        console.error("TOKEN GENERATION ERROR:", error.message);
        throw new ApiError(500, "Failed to generate security tokens.");
    }
};

// --- REGISTER USER ---
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // 1. Basic validation check (Expand as needed)
    if ([name, email, password].some(field => !field || field.trim() === "")) {
        throw new ApiError(400, "All fields (name, email, password) are required.");
    }
    if (!validator.isEmail(email)) {
        throw new ApiError(400, "Please provide a valid email address.");
    }
    if (await User.findOne({ email })) {
        throw new ApiError(409, "User with this email already exists.");
    }

    // 2. Create user
    const user = await User.create({ name, email, password });

    // Select user without sensitive data
    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) {
        throw new ApiError(500, "User creation failed, please try again.");
    }

    // 3. Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    // 4. Set cookies with correct, matching maxAge
    const accessTokenExpiryMs = ms(process.env.ACCESS_TOKEN_EXPIRY || "15m");
    const refreshTokenExpiryMs = ms(process.env.REFRESH_TOKEN_EXPIRY || "30d");

    res.cookie("accessToken", accessToken, {
        ...cookieOptions,
        maxAge: accessTokenExpiryMs
    });
    res.cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: refreshTokenExpiryMs
    });

    // 5. Send response
    return res.status(201).json(
        new ApiResponse(201, { user: createdUser }, "User registered successfully")
    );
});

// --- LOGIN USER ---
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required.");
    }

    // 1. Find user
    const user = await User.findOne({ email });
    if (!user) throw new ApiError(401, "Invalid credentials: User not found");

    // 2. Password check
    const isMatch = await user.isPasswordCorrect(password);
    if (!isMatch) throw new ApiError(401, "Invalid credentials: Password incorrect");

    // 3. Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    // 4. Set cookies
    const accessTokenExpiryMs = ms(process.env.ACCESS_TOKEN_EXPIRY || "15m");
    const refreshTokenExpiryMs = ms(process.env.REFRESH_TOKEN_EXPIRY || "30d");

    res.cookie("accessToken", accessToken, {
        ...cookieOptions,
        maxAge: accessTokenExpiryMs
    });
    res.cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: refreshTokenExpiryMs
    });

    // 5. Send response
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    return res.status(200).json(
        new ApiResponse(200, { user: loggedInUser }, "Login successful")
    );
});

// --- REFRESH ACCESS TOKEN CONTROLLER ---
const refreshAccessToken = asyncHandler(async (req, res) => {

    const incomingRefreshToken = req.cookies?.refreshToken;

    if (!incomingRefreshToken) {
        res.clearCookie("accessToken", cookieOptions);
        res.clearCookie("refreshToken", cookieOptions);
        throw new ApiError(401, "Refresh token not found");
    }

    try {
        const decoded = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decoded._id);

        if (!user || user.refreshToken !== incomingRefreshToken) {
            res.clearCookie("accessToken", cookieOptions);
            res.clearCookie("refreshToken", cookieOptions);
            throw new ApiError(401, "Invalid Refresh Token");
        }

        const newAccessToken = jwt.sign(
            { _id: user._id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
        );

        res.cookie("accessToken", newAccessToken, {
            ...cookieOptions,
            maxAge: ms(process.env.ACCESS_TOKEN_EXPIRY || "15m")
        });

        return res.status(200).json(
            new ApiResponse(200, { accessToken: newAccessToken }, "New access token generated")
        );

    } catch (error) {
        res.clearCookie("accessToken", cookieOptions);
        res.clearCookie("refreshToken", cookieOptions);
        throw new ApiError(401, "Invalid or expired refresh token");
    }
});



// --- LOGOUT USER (Requires verifyjwt middleware) ---
const logoutUser = asyncHandler(async (req, res) => {
    // 1. Clear the refreshToken from the database
    // req.user is available thanks to `verifyjwt` middleware
    await User.findByIdAndUpdate(
        req.user._id,
        { $set: { refreshToken: null } },
        { new: true }
    );

    // 2. Clear both cookies from the browser
    // NOTE: For clearing cookies, the options must match the options used when setting them, 
    // especially 'secure' and 'sameSite', otherwise the browser won't find and clear them.
    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    return res.status(200).json(
        new ApiResponse(200, {}, "User logged out successfully")
    );
});

// --- GET CURRENT USER (The one we are keeping) ---
const getCurrentUser = asyncHandler(async (req, res) => {
    // req.user is attached by verifyjwt middleware
    const user = await User.findById(req.user._id).select("-password -refreshToken");
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    return res.status(200).json(
        new ApiResponse(200, { user: user }, "Current user fetched")
    );
});

// --- FORGET PASSWORD ---
const forgetPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email || !validator.isEmail(email)) {
        throw new ApiError(400, "Please enter a valid email address");
    }

    const user = await User.findOne({ email });
    if (!user) {
        // Do not return a 404, to avoid leaking user existence. Return 200 with a generic message.
        return res.status(200).json(
            new ApiResponse(200, {}, "If a user exists, a password reset email has been sent.")
        );
    }

    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();
    user.forgotPasswordToken = hashedToken;
    user.forgotPasswordExpiry = tokenExpiry;
    await user.save({ validateBeforeSave: false });

    // Ensure FORGOT_PASSWORD_REDIRECT_URL is correctly set in your .env file
    const resetUrl = `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`;

    await sendEmail({
        email: user.email,
        subject: "Reset your Password",
        mailgenContent: forgotPasswordMailgenContent(
            user.name,
            resetUrl
        )
    });

    return res.status(200).json(
        new ApiResponse(200, {}, "Password reset mail sent successfully")
    );
});

// --- RESET FORGOT PASSWORD ---
const resetForgotPassword = asyncHandler(async (req, res) => {
    const { resetToken } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
        throw new ApiError(400, "New password is required.");
    }

    const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    const user = await User.findOne({
        forgotPasswordToken: hashedToken,
        forgotPasswordExpiry: { $gt: Date.now() }
    });

    if (!user) {
        throw new ApiError(401, "Token is invalid or expired. Please request a new link.");
    }

    // Add basic password strength validation here if desired
    if (newPassword.length < 8) {
        throw new ApiError(400, "Password must be at least 8 characters.");
    }

    user.password = newPassword;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    // user.save() will re-run password hashing due to the pre-save hook on the UserModel
    await user.save();

    return res.status(200).json(
        new ApiResponse(200, {}, "Password reset successfully. You can now log in.")
    );
});

// --- ADMIN LOGIN ---
const adminLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const adminEmail = process.env.ADMIN_LOGIN_EMAIL;
    const adminPassword = process.env.ADMIN_LOGIN_PASSWORD;

    if (adminEmail !== email || adminPassword !== password) {
        throw new ApiError(401, "Invalid admin credentials.");
    }

    const token = jwt.sign({ email, role: "admin" }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "7d",
    });

    const adminCookieOptions = {
        ...cookieOptions,
        maxAge: ms("7d"),
    };

    // 🎯 FIX: Changed "AccessToken" to "accessToken" (lowercase 'a')
    res.cookie("accessToken", token, adminCookieOptions);

    return res.status(200).json(
        new ApiResponse(
            200,
            { adminEmail: email, accessToken: token },
            "Admin Login Successfully"
        )
    );
});
// --- CURRENT ADMIN (Check if admin token is valid) ---
const currentAdmin = asyncHandler(async (req, res) => {
    // 🎯 FIX: Must check for 'accessToken' (lowercase 'a')
    const token = req.cookies?.accessToken;

    if (!token) {
        throw new ApiError(401, "Unauthorized: No admin token provided");
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        if (decoded.email !== process.env.ADMIN_LOGIN_EMAIL) {
            throw new ApiError(403, "Token belongs to a non-admin user.");
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { email: decoded.email, role: decoded.role || "admin" },
                    "Current admin fetched successfully"
                )
            );
    } catch (error) {
        // FIX: Clear the cookie with the correct name
        res.clearCookie("accessToken", cookieOptions);
        throw new ApiError(401, "Invalid or expired admin token");
    }
});

// --- ADMIN LOGOUT ---
const adminLogout = asyncHandler(async (req, res) => {
    // 🎯 FIX: Clear the cookie with the correct name
    res.clearCookie("accessToken", cookieOptions);

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Admin Successfully logged out"
        )
    );
});

// --- EXPORT ALL CONTROLLERS ---
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