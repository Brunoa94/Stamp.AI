/**
 * Product types for stamp catalog
 */

export type StampCatalogProduct = {
  id: string;
  name: string;
  image: string;
  blueprint_id: number;
  print_provider_id: number;
  fabricType: string;
  price: number;
  providerName?: string;
  availabilityStatus?:
    | "in_stock"
    | "out_of_stock"
    | "discontinued"
    | "temporarily_unavailable";
};
