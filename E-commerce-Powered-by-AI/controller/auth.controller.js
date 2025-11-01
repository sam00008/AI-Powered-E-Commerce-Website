import { ApiResponse } from "../utils/api_Response.js";
import { ApiError } from "../utils/api_Error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { forgotPasswordMailgenContent, sendEmail } from "../utils/mail.js";
import validator from "validator";
import User from "../model/userModel.js"; // ✅ Correct import
import crypto from "crypto";
import jwt from "jsonwebtoken";
// Generate Access & Refresh Tokens
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(404, "User not found while generating tokens");
        }

        const AccessToken = user.generateAccessToken();
        const RefreshToken = user.generateRefreshToken();

        // Save refresh token to DB
        user.refreshToken = RefreshToken;
        await user.save({ validateBeforeSave: false });

        return { AccessToken, RefreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // 1. Check if user already exists
    const existedUser = await User.findOne({ email });
    if (existedUser) {
        throw new ApiError(409, "User already exists");
    }

    // 2. Validate email
    if (!validator.isEmail(email)) {
        throw new ApiError(400, "Please enter a valid email address");
    }

    // 3. Validate password
    if (password.length < 6) {
        throw new ApiError(401, "Password must be at least 5 characters long");
    }

    // 4. Create new user
    const user = await User.create({ name, email, password });

    // 5. Fetch user without password
    const createdUser = await User.findById(user._id).select("-password");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    // 6. Generate tokens
    const { AccessToken, RefreshToken } = await generateAccessAndRefreshToken(user._id);

    // 7. Send success response
    return res.status(201).json(
        new ApiResponse(
            201,
            {
                user: createdUser,
                AccessToken,
                RefreshToken
            },
            "User registered successfully"
        )
    );
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) throw new ApiError(401, "Invalid credentials");

    const isMatch = await user.isPasswordCorrect(password);
    if (!isMatch) throw new ApiError(401, "Invalid credentials");

    // Sign JWT
    const token = jwt.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
    });

    // Set cookie
    res.cookie("accessToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // true in prod, false in dev
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        maxAge: 24 * 60 * 60 * 1000,
    });

    // Return user data
    res.status(200).json({
        status: 200,
        data: { user: { name: user.name, email: user.email, _id: user._id } },
        message: "Login successful",
    });
});


const logoutUser = asyncHandler(async (req, res) => {
    // 1. Clear the refresh token in database
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { refreshToken: "" }
        },
        { new: true }
    );

    // 2. Define cookie options
    const options = {
        httpOnly: true,
        secure: true, // Use secure cookies in production
    };

    // 3. Clear cookies and return response
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                200,
                {},
                "User logged out successfully"
            )
        );
});

const forgetPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!validator.isEmail(email)) {
        throw new ApiError(400, "Please enter a valid email address");
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();
    user.forgotPasswordToken = hashedToken;
    user.forgotPasswordExpiry = tokenExpiry;
    await user.save({ validateBeforeSave: false });

    await sendEmail({
        email: user.email,
        subject: "Reset your Password",
        mailgenContent: forgotPasswordMailgenContent(
            user.name,
            `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`
        )
    });

    return res
        .status(200)
        .json({
            message: "Password reset mail sent successfully",
            success: true
        });
});

const resetForgotPassword = asyncHandler(async (req, res) => {
    const { resetToken } = req.params;
    const { newPassword } = req.body;

    const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    const user = await User.findOne({
        forgotPasswordToken: hashedToken,
        forgotPasswordExpiry: { $gt: Date.now() }
    });

    if (!user) {
        throw new ApiError(489, "Token is invalid or expired");
    }

    user.password = newPassword;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save();

    return res
        .status(200)
        .json({
            message: "Password reset successfully",
            success: true
        });
});
const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                req.user,
                "current User fetched successfully"
            )
        );
});

const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const adminEmail = process.env.ADMIN_LOGIN_EMAIL;
  const adminPassword = process.env.ADMIN_LOGIN_PASSWORD;

  // Always return JSON, no HTML
  if (adminEmail !== email) {
    return res.status(401).json({ message: "Invalid Email Id" });
  }

  if (adminPassword !== password) {
    return res.status(401).json({ message: "Password not correct" });
  }

  // Sign JWT
  const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  // Set cookie
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // true only in production
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  res.cookie("AccessToken", token, cookieOptions);

  // Return JSON
  return res.status(200).json(
    new ApiResponse(
      200,
      { adminEmail: email, accessToken: token },
      "Admin Login Successfully"
    )
  );
});

export {
    registerUser,
    loginUser,
    logoutUser,
    forgetPassword,
    resetForgotPassword,
    getCurrentUser,
    adminLogin
};
