/**
 * Print Placement Types
 *
 * Types for the automated print placement verification and correction system.
 */

export interface PrintAreaDimensions {
  position: string;
  width: number;
  height: number;
}

export interface PlacementParams {
  x: number;      // 0.0-1.0, horizontal position (0.5 = center)
  y: number;      // 0.0-1.0, vertical position (0.5 = center)
  scale: number;  // Scale factor (1.0 = image width fills print area width)
  angle: number;  // Rotation in degrees
}

export interface ArtworkDimensions {
  width: number;
  height: number;
}

export interface SafeZone {
  top: number;    // Percentage margin from top (0.0-1.0)
  bottom: number; // Percentage margin from bottom
  left: number;   // Percentage margin from left
  right: number;  // Percentage margin from right
}

export interface ProductConfig {
  blueprintId: number;
  name: string;
  category: 'apparel' | 'mug' | 'poster' | 'tote' | 'pillow' | 'canvas' | 'socks';
  positions: string[];
  defaultPosition: string;
  safeZone: SafeZone;
  minDpi: number;
  anchorY?: number;  // Custom Y anchor (e.g., 0.45 for chest placement)
  disablePlacementAdjustment?: boolean;  // Disable manual placement controls (e.g., for mugs)
  scaleOnly?: boolean;  // Allow only scale adjustment, keep centered (e.g., for tote bags)
}

export interface VariantPrintArea {
  variantId: number;
  size: string;
  printAreas: PrintAreaDimensions[];
}

export interface PlacementVerificationResult {
  pass: boolean;
  placement: PlacementParams;
  reason?: string;
  boundingBox?: BoundingBox;
  effectiveDpi?: number;
  iterations?: number;
}

export interface BoundingBox {
  left: number;   // 0.0-1.0, relative to print area
  right: number;
  top: number;
  bottom: number;
}

export interface VerificationReport {
  blueprintId: number;
  variantId: number;
  artworkDimensions: ArtworkDimensions;
  printAreaDimensions: PrintAreaDimensions;
  initialPlacement: PlacementParams;
  finalPlacement: PlacementParams;
  iterations: number;
  pass: boolean;
  reason: string;
  mockupUrl?: string;
  timestamp: string;
}
