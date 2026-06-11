import { useState } from "react";
import axios from "axios";
import { api } from "../services/api.js";

export const useCloudinaryUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const uploadImage = async (file, folder = "inkforge_posts") => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Step 1: Request upload signature from backend
      const sigResponse = await api.get(`/uploads/signature?folder=${folder}`);
      const { signature, timestamp, apiKey, cloudName } = sigResponse.data?.data || {};

      if (!signature || !cloudName) {
        throw new Error("Failed to retrieve upload signature from backend");
      }

      // Step 2: Prepare FormData for Cloudinary Direct Upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);
      formData.append("folder", folder);

      // Step 3: Direct POST to Cloudinary upload URL
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      const cloudinaryResponse = await axios.post(uploadUrl, formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percent);
          }
        },
      });

      const secureUrl = cloudinaryResponse.data?.secure_url;
      const publicId = cloudinaryResponse.data?.public_id;

      return { secureUrl, publicId };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to upload image";
      setError(msg);
      throw new Error(msg);
    } finally {
      setUploading(false);
    }
  };

  return { uploadImage, uploading, progress, error };
};
