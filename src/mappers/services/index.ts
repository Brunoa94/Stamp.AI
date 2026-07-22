/**
 * Service Mappers
 *
 * This module provides mapper classes for transforming data between different formats
 * across all services in the application. Mappers handle the conversion between:
 * - Database types and application types
 * - External API responses and internal data structures
 * - Input/output formatting for service methods
 *
 * Usage:
 * import { ProductServiceMapper, CartServiceMapper } from '@/mappers/services';
 */

export { AuthServiceMapper } from './authServiceMapper';
export { CartServiceMapper } from './cartServiceMapper';
export { CustomProductServiceMapper } from './customProductServiceMapper';
export { ImageGenerationServiceMapper } from './imageGenerationServiceMapper';
export { OrderServiceMapper } from './orderServiceMapper';
export { ProductServiceMapper } from './productServiceMapper';

// Re-export types that are commonly used
export type { SavePrintifyProductInput } from './productServiceMapper';
export type { ImageGenerationRequestPayload } from './imageGenerationServiceMapper';
