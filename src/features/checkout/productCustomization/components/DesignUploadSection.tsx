import clsx from "clsx";
import ImageUploader from "@/features/dashboard/uploadImage/ImageUploader";
import { PrintifyImageT } from "@/schemas/checkout";

interface Props {
  uploadedFrontImage: PrintifyImageT | null;
  uploadedBackImage: PrintifyImageT | null;
  activePrintSide: "front" | "back";
  onFrontImageUpload: (file: File) => void;
  onBackImageUpload: (file: File) => void;
  onRemoveFrontImage: () => void;
  onRemoveBackImage: () => void;
  onSideChange: (side: "front" | "back") => void;
}

const DesignUploadSection = ({
  uploadedFrontImage,
  uploadedBackImage,
  activePrintSide,
  onFrontImageUpload,
  onBackImageUpload,
  onRemoveFrontImage,
  onRemoveBackImage,
  onSideChange,
}: Props) => {
  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6">
      <header className="mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span
            className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm"
            aria-hidden="true"
          >
            1
          </span>
          Upload Your Design
        </h3>
      </header>

      {/* Front/Back Toggle */}
      <div className="flex gap-2 mb-4" role="tablist">
        <button
          onClick={() => onSideChange("front")}
          role="tab"
          aria-selected={activePrintSide === "front"}
          aria-controls="front-design-panel"
          className={clsx(
            "flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            {
              "bg-blue-600 text-white border-blue-600": activePrintSide === "front",
              "bg-white text-gray-700 border-gray-300 hover:border-gray-400":
                activePrintSide !== "front",
            }
          )}
        >
          Front Design {uploadedFrontImage && "✓"}
        </button>
        <button
          onClick={() => onSideChange("back")}
          role="tab"
          aria-selected={activePrintSide === "back"}
          aria-controls="back-design-panel"
          className={clsx(
            "flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            {
              "bg-blue-600 text-white border-blue-600": activePrintSide === "back",
              "bg-white text-gray-700 border-gray-300 hover:border-gray-400":
                activePrintSide !== "back",
            }
          )}
        >
          Back Design {uploadedBackImage && "✓"} (Optional)
        </button>
      </div>

      {/* Front Uploader */}
      {activePrintSide === "front" && (
        <div
          role="tabpanel"
          id="front-design-panel"
          aria-labelledby="front-design-tab"
        >
          <p className="text-sm text-gray-600 mb-3">
            Upload your front design. This will be printed on the front of the product.
          </p>
          <ImageUploader
            onImageUpload={onFrontImageUpload}
            uploadedImage={null}
            onRemoveImage={onRemoveFrontImage}
          />
          {uploadedFrontImage && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
              <p className="text-green-700 text-sm flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Front design: {uploadedFrontImage.file_name}
              </p>
              <button
                onClick={onRemoveFrontImage}
                className="text-red-600 hover:text-red-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded px-2 py-1"
                aria-label="Remove front design"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      )}

      {/* Back Uploader */}
      {activePrintSide === "back" && (
        <div
          role="tabpanel"
          id="back-design-panel"
          aria-labelledby="back-design-tab"
        >
          <p className="text-sm text-gray-600 mb-3">
            Upload your back design (optional). This will be printed on the back of the
            product.
          </p>
          <ImageUploader
            onImageUpload={onBackImageUpload}
            uploadedImage={null}
            onRemoveImage={onRemoveBackImage}
          />
          {uploadedBackImage && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
              <p className="text-green-700 text-sm flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Back design: {uploadedBackImage.file_name}
              </p>
              <button
                onClick={onRemoveBackImage}
                className="text-red-600 hover:text-red-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded px-2 py-1"
                aria-label="Remove back design"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      )}

      {/* Summary of uploaded designs */}
      {(uploadedFrontImage || uploadedBackImage) && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">Uploaded Designs:</p>
          <div className="flex gap-4">
            {uploadedFrontImage?.preview_url && (
              <figure className="text-center">
                <img
                  src={uploadedFrontImage.preview_url}
                  alt="Front design preview"
                  className="w-16 h-16 object-contain border border-gray-300 rounded mb-1"
                />
                <figcaption className="text-xs text-gray-500">Front</figcaption>
              </figure>
            )}
            {uploadedBackImage?.preview_url && (
              <figure className="text-center">
                <img
                  src={uploadedBackImage.preview_url}
                  alt="Back design preview"
                  className="w-16 h-16 object-contain border border-gray-300 rounded mb-1"
                />
                <figcaption className="text-xs text-gray-500">Back</figcaption>
              </figure>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default DesignUploadSection;
