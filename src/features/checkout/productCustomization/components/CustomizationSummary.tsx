import { CatalogBlueprintT, PrintifyImageT } from "@/schemas/checkout";
import type { TshirtType } from "@/queries/productQueries";
import { Button } from "@/features/ui/button";
import clsx from "clsx";

interface Props {
  selectedBlueprint: CatalogBlueprintT;
  uploadedFrontImage: PrintifyImageT;
  uploadedBackImage: PrintifyImageT | null;
  selectedColor: string;
  selectedSize: string;
  selectedTshirtType: TshirtType;
  quantity: number;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

const CustomizationSummary = ({
  selectedBlueprint,
  uploadedFrontImage,
  uploadedBackImage,
  selectedColor,
  selectedSize,
  selectedTshirtType,
  quantity,
  onSubmit,
  isSubmitting = false,
}: Props) => {
  const totalPrice = (25.0 + selectedTshirtType.price) * quantity;

  return (
    <section className="bg-gray-50 border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
      <article className="flex items-start gap-4">
        <div className="flex gap-2">
          {uploadedFrontImage.preview_url && (
            <figure className="text-center">
              <img
                src={uploadedFrontImage.preview_url}
                alt="Front design preview"
                className="w-16 h-16 object-contain border border-gray-300 rounded"
              />
              <figcaption className="text-xs text-gray-500">Front</figcaption>
            </figure>
          )}
          {uploadedBackImage?.preview_url && (
            <figure className="text-center">
              <img
                src={uploadedBackImage.preview_url}
                alt="Back design preview"
                className="w-16 h-16 object-contain border border-gray-300 rounded"
              />
              <figcaption className="text-xs text-gray-500">Back</figcaption>
            </figure>
          )}
        </div>
        <div className="flex-1">
          <p className="font-medium text-gray-900">{selectedBlueprint.title}</p>
          <p className="text-gray-600 text-sm">
            {selectedColor} / {selectedSize}
          </p>
          <p className="text-gray-600 text-sm">
            T-shirt: {selectedTshirtType.name} (+$
            {selectedTshirtType.price.toFixed(2)})
          </p>
          <p className="text-gray-600 text-sm">Quantity: {quantity}</p>
          <p className="text-gray-500 text-xs mt-1">
            Print areas: Front{uploadedBackImage ? " + Back" : ""}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-gray-900">
            ${totalPrice.toFixed(2)}
          </p>
          <p className="text-gray-500 text-xs">Est. price</p>
        </div>
      </article>

      <Button
        onClick={onSubmit}
        disabled={isSubmitting}
        className={clsx(
          "mt-6 w-full py-3 px-6 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          {
            "bg-blue-600 text-white hover:bg-blue-700": !isSubmitting,
            "bg-gray-400 text-gray-200 cursor-not-allowed": isSubmitting,
          },
        )}
      >
        {isSubmitting ? "Processing..." : "Continue to Checkout"}
      </Button>
    </section>
  );
};

export default CustomizationSummary;
