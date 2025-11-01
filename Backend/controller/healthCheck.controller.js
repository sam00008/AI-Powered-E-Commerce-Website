import { ApiResponse } from "../utils/api_Response";
import { ApiError } from "../utils/api_Error";
import { asyncHandler } from "../utils/async-handler";

const healthCheck = asyncHandler(async (req, res) => {
    res
        .status(200)
        .json(new ApiResponse(
            200,
            null,
            "Server health is awesome"
        ));
});

export { healthCheck };