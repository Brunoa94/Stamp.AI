import { BlueprintI } from "@/shared-types";
import { TshirtType } from "@/queries/productQueries";

export const mapBlueprintsToTshirtProducts = (
  blueprints: BlueprintI[],
  printProviderId?: number
): TshirtType[] => {
  return blueprints.map((blueprint) => ({
    id: `blueprint-${blueprint.id}`,
    name: blueprint.title,
    description:
      blueprint.description || `${blueprint.brand} ${blueprint.model}`,
    image: blueprint.images[0] || "/api/placeholder/200/200",
    features: blueprint.printAreas.map((area) => area.position),
    price: 0, // Base price, will be determined by variant selection
    material: blueprint.brand || "Cotton",
    fit: "Classic",
    blueprint_id: blueprint.id,
    print_provider_id: printProviderId || 99,
    brand: blueprint.brand,
    model: blueprint.model,
  }));
};
