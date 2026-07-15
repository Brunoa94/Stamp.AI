import type { LucideIcon } from "lucide-react";

/**
 * Stamp Types
 *
 * Type definitions for the Stamp luxury theme flow.
 * All types follow the naming convention: {Name}Type
 */

// Step navigation types
export type StampStepType = {
  id: string;
  number: string;
  title: string;
  label: string;
};

// Edit suggestion tiles (Synthesis left-panel grid)
export type EditSuggestionType = {
  id: string;
  label: string;
  hint: string;
  prompt: string;
  /** Path to a representative thumbnail image (public/). */
  image: string;
};

// Product types
export type ProductTypeIdType = "tshirt" | "hoodie" | "tote" | "poster";

export type ProductTypeInfoType = {
  id: ProductTypeIdType;
  blueprintIds: number[];
  name: string;
  icon: LucideIcon;
  price: string;
  specs: string;
};

// Color types
export type FabricColorType = {
  name: string;
  hex: string;
  label: string;
};

// Size types - extended to support all Printify sizes including accessories
export type SizeType =
  | "XS"
  | "S"
  | "M"
  | "L"
  | "XL"
  | "XXL"
  | "2XL"
  | "3XL"
  | "4XL"
  | "5XL"
  | "One Size"
  // Poster/print sizes
  | "8×10"
  | "12×16"
  | "12×18"
  | "16×20"
  | "18×24"
  | "24×36"
  // Mug sizes
  | "11oz"
  | "15oz";

// Presentation-layer catalog product (mapped from CatalogProduct)
export type CatalogProductMappedType = {
  blueprintId: number;
  name: string;
  imageUrl: string;
  printProviderId: number;
  price: number;
  providerName: string;
};
