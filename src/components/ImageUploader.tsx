"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface ImageUploaderProps {
  onUploadComplete: (imageData: PrintifyImage) => void;
  onError?: (error: string) => void;
}

export interface PrintifyImage {
  id: string;
  file_name: string;
  height: number;
  width: number;
  size: number;
  mime_type: string;
  preview_url: string;
}

export default function ImageUploader({
  onUploadComplete,
  onError,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const supabase = createClient();

  const handleUpload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        onError?.("Please upload an image file");
        return;
      }

      // Max 10MB
      if (file.size > 10 * 1024 * 1024) {
        onError?.("Image must be less than 10MB");
        return;
      }

      setUploading(true);

      try {
        // Convert file to base64
        const base64 = await fileToBase64(file);

        // Create preview
        setPreview(base64);

        // Upload to Printify via Supabase function
        const { data, error } = await supabase.functions.invoke(
          "upload-printify-image",
          {
            body: {
              image_base64: base64,
              file_name: file.name,
            },
          }
        );

        if (error) {
          throw new Error(error.message);
        }

        if (!data.success) {
          throw new Error(data.error || "Upload failed");
        }

        console.log("Image uploaded to Printify:", data.image);
        onUploadComplete(data.image);
      } catch (err) {
        console.error("Upload error:", err);
        onError?.(err instanceof Error ? err.message : "Upload failed");
        setPreview(null);
      } finally {
        setUploading(false);
      }
    },
    [supabase, onUploadComplete, onError]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleUpload(e.dataTransfer.files[0]);
      }
    },
    [handleUpload]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        handleUpload(e.target.files[0]);
      }
    },
    [handleUpload]
  );

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="space-y-4">
            <img
              src={preview}
              alt="Preview"
              className="max-h-48 mx-auto rounded-lg shadow-md"
            />
            {uploading && (
              <div className="flex items-center justify-center gap-2 text-blue-600">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Uploading to Printify...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
            </div>
            <div>
              <p className="text-gray-600">
                Drag and drop your design here, or{" "}
                <label className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium">
                  browse
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileInput}
                    disabled={uploading}
                  />
                </label>
              </p>
              <p className="text-sm text-gray-400 mt-2">
                PNG, JPG up to 10MB • Recommended: 4500 x 5400 px
              </p>
            </div>
          </div>
        )}
      </div>

      {preview && !uploading && (
        <button
          type="button"
          onClick={() => setPreview(null)}
          className="mt-2 text-sm text-gray-500 hover:text-gray-700"
        >
          Remove and upload different image
        </button>
      )}
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
