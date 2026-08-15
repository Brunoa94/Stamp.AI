import type { AnalyticsEventParamsT } from "../types/analyticsTypes";

/**
 * Stamp Flow Analytics Mappers
 *
 * Centralized mapping functions for stamp flow event payloads.
 */

// ============================================================================
// STEP CHANGE EVENT
// ============================================================================

export interface StepChangeParams {
  fromStep: number;
  toStep: number;
}

export function mapStepChangeEvent(params: StepChangeParams): AnalyticsEventParamsT {
  return {
    from_step: params.fromStep,
    to_step: params.toStep,
    direction: params.toStep > params.fromStep ? "forward" : "backward",
  };
}

// ============================================================================
// COLOR SELECT EVENT
// ============================================================================

export interface ColorSelectParams {
  color: string;
  productId?: number;
}

export function mapColorSelectEvent(params: ColorSelectParams): AnalyticsEventParamsT {
  return {
    color: params.color,
    product_id: params.productId,
  };
}

// ============================================================================
// SIZE SELECT EVENT
// ============================================================================

export interface SizeSelectParams {
  size: string;
  productId?: number;
}

export function mapSizeSelectEvent(params: SizeSelectParams): AnalyticsEventParamsT {
  return {
    size: params.size,
    product_id: params.productId,
  };
}

// ============================================================================
// GENERATE COMPLETE EVENT
// ============================================================================

export interface GenerateCompleteParams {
  promptLength: number;
  usedReferenceImage: boolean;
}

export function mapGenerateCompleteEvent(params: GenerateCompleteParams): AnalyticsEventParamsT {
  return {
    step: "generation",
    prompt_length: params.promptLength,
    used_reference_image: params.usedReferenceImage,
  };
}

// ============================================================================
// GENERATE FAILED EVENT
// ============================================================================

export interface GenerateFailedParams {
  reason: "timeout" | "error";
}

export function mapGenerateFailedEvent(params: GenerateFailedParams): AnalyticsEventParamsT {
  return {
    step: "generation",
    reason: params.reason,
  };
}

// ============================================================================
// GENERATE START EVENT
// ============================================================================

export interface GenerateStartParams {
  promptLength: number;
  preservation: number;
}

export function mapGenerateStartEvent(params: GenerateStartParams): AnalyticsEventParamsT {
  return {
    step: "synthesis",
    prompt_length: params.promptLength,
    preservation: params.preservation,
  };
}

// ============================================================================
// IMAGE UPLOAD EVENT
// ============================================================================

export interface ImageUploadParams {
  fileType: string;
  fileSizeKb: number;
}

export function mapImageUploadEvent(params: ImageUploadParams): AnalyticsEventParamsT {
  return {
    step: "upload",
    file_type: params.fileType,
    file_size_kb: params.fileSizeKb,
  };
}

// ============================================================================
// SELECT ITEM EVENT (Product Selection)
// ============================================================================

export interface SelectItemParams {
  blueprintId: number;
  productName: string;
  price: number;
}

export function mapSelectItemEvent(params: SelectItemParams): AnalyticsEventParamsT {
  return {
    item_list_name: "stamp_product_selection",
    items: [
      {
        item_id: String(params.blueprintId),
        item_name: params.productName,
        price: params.price,
      },
    ],
  };
}

// ============================================================================
// CREATE PRODUCT EVENT
// ============================================================================

export interface CreateProductParams {
  blueprintId: number;
  color: string;
  size: string;
}

export function mapCreateProductEvent(params: CreateProductParams): AnalyticsEventParamsT {
  return {
    step: "customization",
    product_id: params.blueprintId,
    color: params.color,
    size: params.size,
  };
}

// ============================================================================
// ADD TO CART EVENT
// ============================================================================

export interface AddToCartParams {
  productId: string;
  productName: string;
  unitPriceCents: number;
  variantId: number;
}

export function mapAddToCartEvent(params: AddToCartParams): AnalyticsEventParamsT {
  return {
    currency: "USD",
    value: params.unitPriceCents / 100,
    items: [
      {
        item_id: params.productId,
        item_name: params.productName,
        price: params.unitPriceCents / 100,
        quantity: 1,
        item_variant: params.variantId.toString(),
      },
    ],
  };
}
