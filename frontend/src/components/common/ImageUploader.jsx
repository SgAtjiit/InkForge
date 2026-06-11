import React, { useState, useRef } from "react";
import { useCloudinaryUpload } from "../../hooks/useCloudinaryUpload.js";
import { UploadCloud, X, Loader2, AlertCircle } from "lucide-react";

export const ImageUploader = ({ value, onChange, label = "Cover Image" }) => {
  const { uploadImage, uploading, progress, error: uploadError } = useCloudinaryUpload();
  const [dragActive, setDragActive] = useState(false);
  const [localError, setLocalError] = useState("");
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    setLocalError("");
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setLocalError("Please select a valid image file (PNG, JPG, WEBP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setLocalError("Image size must be less than 5MB");
      return;
    }

    try {
      const { secureUrl } = await uploadImage(file);
      onChange(secureUrl);
    } catch (err) {
      setLocalError(err.message || "Failed to upload image");
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
        {label}
      </label>

      {(localError || uploadError) && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{localError || uploadError}</span>
        </div>
      )}

      {value ? (
        <div className="relative rounded-2xl overflow-hidden glass-card border border-slate-200 group h-56 bg-slate-100">
          <img src={value} alt="Uploaded cover" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors shadow-md"
            >
              Replace Image
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="p-2 rounded-xl bg-rose-600 text-white hover:bg-rose-500 transition-colors shadow-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            dragActive
              ? "border-indigo-600 bg-indigo-50/80 scale-[1.01]"
              : "border-slate-300 hover:border-indigo-400 bg-slate-50 hover:bg-slate-100/80"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="hidden"
          />

          {uploading ? (
            <div className="space-y-3 py-4">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <p className="text-sm text-slate-700 font-semibold">Uploading to Cloudinary... {progress}%</p>
              <div className="w-48 h-1.5 bg-slate-200 rounded-full mx-auto overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-600 to-violet-600 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3 py-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Click to upload <span className="font-normal text-slate-500">or drag and drop</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">PNG, JPG, WEBP up to 5MB</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
