import { theme } from "@/theme";
import clsx from "clsx";
import ImageUploader from "./ImageUploader";

interface IImageUploadSectionProps {
  uploadedImage: File | null;
  onImageUpload: (file: File) => void;
  onRemoveImage: () => void;
}

const ImageUploadSection = ({
  uploadedImage,
  onImageUpload,
  onRemoveImage,
}: IImageUploadSectionProps) => {
  return (
    <article
      className={clsx(
        theme.upload.section,
        theme.animations.slideInLeft,
        "transition-all duration-500"
      )}
    >
      <div
        className={clsx(theme.upload.card, "transition-all duration-700", {
          "ring-2 ring-green-200 bg-linear-to-br from-green-50/20 via-white to-purple-50/30":
            uploadedImage,
        })}
      >
        <div className="flex items-center mb-6">
          <div
            className={clsx(
              "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-4 transition-all duration-500 animate-[bounceIn_0.6s_ease-out]",
              {
                "bg-linear-to-r from-green-500 to-emerald-500 scale-110 animate-pulse":
                  uploadedImage,
                "bg-linear-to-r from-purple-500 to-pink-500": !uploadedImage,
              }
            )}
          >
            {uploadedImage ? "✓" : "1"}
          </div>
          <h2 className={theme.upload.title}>Upload Your Canvas</h2>
        </div>
        <ImageUploader
          onImageUpload={onImageUpload}
          uploadedImage={uploadedImage}
          onRemoveImage={onRemoveImage}
        />
      </div>
    </article>
  );
};

export default ImageUploadSection;
