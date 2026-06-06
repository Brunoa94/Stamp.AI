import clsx from "clsx";
import { CatalogBlueprintT } from "@/schemas/checkout";
import Image from "next/image";

interface Props {
  catalogBlueprints: CatalogBlueprintT[];
  selectedBlueprint: CatalogBlueprintT | null;
  onBlueprintSelect: (blueprint: CatalogBlueprintT) => void;
}

const ProductSelectionSection = ({
  catalogBlueprints,
  selectedBlueprint,
  onBlueprintSelect,
}: Props) => {
  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6">
      <header className="mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span
            className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm"
            aria-hidden="true"
          >
            2
          </span>
          Choose Product Type
        </h3>
      </header>

      {catalogBlueprints.length === 0 ? (
        <p className="text-gray-500">Loading available products...</p>
      ) : (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          role="radiogroup"
          aria-label="Product type selection"
        >
          {catalogBlueprints.map((blueprint) => {
            const isSelected = selectedBlueprint?.id === blueprint.id;

            return (
              <article
                key={blueprint.id}
                onClick={() => onBlueprintSelect(blueprint)}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onBlueprintSelect(blueprint);
                  }
                }}
                className={clsx(
                  "cursor-pointer border rounded-lg p-4 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                  {
                    "border-blue-500 ring-2 ring-blue-200 bg-blue-50": isSelected,
                    "border-gray-200 hover:border-gray-300 hover:shadow-sm":
                      !isSelected,
                  }
                )}
              >
                {blueprint.images?.[0] && (
                  <div className="relative w-full h-32 mb-2">
                    <Image
                      src={blueprint.images[0]}
                      alt={blueprint.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
                <h4 className="font-medium text-sm truncate">{blueprint.title}</h4>
                <p className="text-gray-500 text-xs">{blueprint.brand}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {blueprint.printAreas.map((area) => (
                    <span
                      key={area.position}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded"
                    >
                      {area.position}
                    </span>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default ProductSelectionSection;
