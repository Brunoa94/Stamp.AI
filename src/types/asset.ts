import type {
  AssetPriceSchema,
  AssetSchema,
  AssetTypeSchema,
} from "@/schemas/asset";
import z from "zod";

export type AssetT = z.infer<typeof AssetSchema>;
export type AssetTypeT = z.infer<typeof AssetTypeSchema>;
export type AssetPriceT = z.infer<typeof AssetPriceSchema>;
