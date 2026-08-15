import type { LucideIcon } from "lucide-react";

/**
 * Stamp Types
 *
 * Type definitions for the Stamp luxury theme flow.
 * All types follow the naming convention: {Name}Type
 */

// Step navigation types
// Display strings (title, label) are translated via `stamp.steps.<id>`.
export type StampStepType = {
  id: string;
  number: string;
};

// Edit suggestion tiles (Synthesis left-panel grid)
export type EditSuggestionType = {
  /**
   * Stable identifier. Also the i18n key: display strings (label, hint,
   * prompt) live under `stamp.suggestions.<id>` in the message catalog.
   */
  id: string;
  /** Path to a representative thumbnail image (public/). */
  image: string;
};

// Product types
export type ProductTypeIdType = "tshirt" | "hoodie" | "tote" | "poster";

type ProductTypeInfoType = {
  id: ProductTypeIdType;
  blueprintIds: number[];
  name: string;
  icon: LucideIcon;
  price: string;
  specs: string;
};

// Color types
type FabricColorType = {
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
  description: string | null;
  /** Raw Printify description (may contain HTML) for spec extraction */
  printifyDescription: string | null;
  imageUrl: string;
  printProviderId: number;
  price: number;
  providerName: string;
};
