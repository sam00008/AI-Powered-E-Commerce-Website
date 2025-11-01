// backend/middleware/auth.middleware.js (Corrected for consistency)

import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api_Error.js";
import jwt from "jsonwebtoken";
import User from "../model/userModel.js";

const verifyjwt = asyncHandler(async (req, res, next) => {
    try {
        // 1. Get token from cookies or authorization header
        // 🎯 FIX: Must be 'accessToken' (lowercase 'a') to match the controller
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized: No token provided");
        }

        // 2. Verify token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // 3. Find user by ID
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid Access Token: User not found");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token");
    }
});

export { verifyjwt };