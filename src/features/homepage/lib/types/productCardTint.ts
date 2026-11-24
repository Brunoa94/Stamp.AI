import type { VariantProps } from "class-variance-authority";
import type { homeProductCardVariants } from "../variants/homeProductCardVariants";

export type HomeProductCardTintT = NonNullable<VariantProps<typeof homeProductCardVariants>["tint"]>;
