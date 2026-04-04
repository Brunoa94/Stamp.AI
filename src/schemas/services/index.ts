/**
 * Service Schemas
 *
 * This module exports validation schemas for all service API requests and responses.
 * Use these schemas to validate data sent to and received from external APIs.
 */

// Image Generation Service Schemas
export {
  ImageGenerationRequestSchema,
  ImageGenerationResponseSchema,
  ImageGenerationResultSchema,
} from './imageGenerationServiceSchemas';

// Printify Service Schemas
export {
  CustomProductResponseSchema,
  CreatePrintifyOrderRequestSchema,
  PrintifyOrderResponseSchema,
  PrintifyOrderLineItemSchema,
  ShippingAddressSchema,
} from './printifyServiceSchemas';

// Auth Service Schemas
export {
  SupabaseUserMetadataSchema,
  SupabaseUserSchema,
  SupabaseSessionSchema,
  SupabaseAuthResponseSchema,
  GetUserResponseSchema,
  GetSessionResponseSchema,
  UpdateUserResponseSchema,
} from './authServiceSchemas';

// Product Customization Service Schemas
export {
  PrintAreaSchema,
  CatalogBlueprintSchema,
  CatalogBlueprintsResponseSchema,
} from './productCustomizationServiceSchemas';
