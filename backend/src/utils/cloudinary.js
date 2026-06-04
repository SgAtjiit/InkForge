import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";
import { ApiError } from "./ApiError.js";

cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
});

export const generateUploadSignature = (folder = "inkforge_uploads") => {
    try {
        const timestamp = Math.round(new Date().getTime() / 1000);
        const paramsToSign = {
            timestamp,
            folder,
        };

        const signature = cloudinary.utils.api_sign_request(
            paramsToSign,
            env.CLOUDINARY_API_SECRET
        );

        return {
            signature,
            timestamp,
            apiKey: env.CLOUDINARY_API_KEY,
            cloudName: env.CLOUDINARY_CLOUD_NAME,
            folder,
        };
    } catch (error) {
        throw new ApiError(500, "Failed to generate Cloudinary upload signature", [error.message]);
    }
};

export const deleteCloudinaryAsset = async (publicId) => {
    if (!publicId) return null;
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error("Cloudinary asset deletion error:", error);
        return null;
    }
};

export { cloudinary };
