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
