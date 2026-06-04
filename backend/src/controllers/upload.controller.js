import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateUploadSignature } from "../utils/cloudinary.js";

export const getUploadSignature = asyncHandler(async (req, res) => {
    const folder = req.query.folder || "inkforge_uploads";
    const signatureData = generateUploadSignature(folder);

    return res
        .status(200)
        .json(new ApiResponse(200, signatureData, "Cloudinary upload signature generated successfully"));
});
