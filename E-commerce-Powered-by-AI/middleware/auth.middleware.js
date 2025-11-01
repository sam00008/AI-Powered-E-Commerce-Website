import User from "../model/userModel.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api_Error.js";
import jwt from "jsonwebtoken";

const verifyjwt = asyncHandler(async (req, res, next) => {
  // 1. Get token from cookies or Authorization header
  const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "").trim();

  if (!token) {
    throw new ApiError(401, "Unauthorized: No token provided");
  }

  try {
    // 2. Verify token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // 3. Find user from decoded token
    const user = await User.findById(decodedToken._id).select("-password");

    if (!user) {
      throw new ApiError(401, "Invalid access token: User not found");
    }

    // 4. Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("JWT verification error:", error.message);
    throw new ApiError(401, "Invalid or expired access token");
  }
});

export { verifyjwt };
