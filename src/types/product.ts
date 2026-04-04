/**
 * Product-related type definitions
 */

export interface TshirtType {
  id: string;
  name: string;
  description: string;
  image: string;
  features: string[];
  price: number;
  material: string;
  fit: string;
  blueprint_id: number;
  print_provider_id: number;
  brand: string;
  model: string;
}
