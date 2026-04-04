import { CreateProductPayloadSchema, CreatedProductSchema } from "@/schemas/customProduct";
import { z } from "zod";

// Infer types from Zod schemas
export type CreateProductPayloadT = z.infer<typeof CreateProductPayloadSchema>;
export type CreatedProductT = z.infer<typeof CreatedProductSchema>;

// Re-export shared Printify types for convenience
export type {
  CreateCustomProductRequestI,
  UploadImageRequestI,
  UploadImageResponseI,
} from "@/types/api";
