// Printify Blueprint Configuration
// These blueprints support front and back printing with Printify Choice (provider 99)

export interface PrintArea {
  position: string;
  width: number;
  height: number;
}

export interface Blueprint {
  id: number;
  title: string;
  brand: string;
  model: string;
  description: string;
  printProviderId: number;
  printAreas: PrintArea[];
  supportsFront: boolean;
  supportsBack: boolean;
  supportsSleeves: boolean;
  supportsNeck: boolean;
}

// Default print provider - Printify Choice
export const DEFAULT_PRINT_PROVIDER_ID = 99;

// Available blueprints with their print area configurations
export const BLUEPRINTS: Blueprint[] = [
  {
    id: 12,
    title: "Unisex Jersey Short Sleeve Tee",
    brand: "Bella+Canvas",
    model: "3001",
    description: "The softest, smoothest, best-looking tee. Made of 100% Airlume cotton.",
    printProviderId: DEFAULT_PRINT_PROVIDER_ID,
    printAreas: [
      { position: "front", width: 2767, height: 3362 },
      { position: "back", width: 2767, height: 3362 },
      { position: "left_sleeve", width: 960, height: 960 },
      { position: "right_sleeve", width: 960, height: 960 },
      { position: "neck", width: 750, height: 750 },
    ],
    supportsFront: true,
    supportsBack: true,
    supportsSleeves: true,
    supportsNeck: true,
  },
  {
    id: 6,
    title: "Unisex Heavy Cotton Tee",
    brand: "Gildan",
    model: "5000",
    description: "Classic heavy cotton tee. 100% cotton with a seamless double-needle collar.",
    printProviderId: DEFAULT_PRINT_PROVIDER_ID,
    printAreas: [
      { position: "front", width: 3951, height: 4919 },
      { position: "back", width: 3951, height: 4919 },
      { position: "left_sleeve", width: 960, height: 960 },
      { position: "right_sleeve", width: 960, height: 960 },
      { position: "neck", width: 750, height: 750 },
    ],
    supportsFront: true,
    supportsBack: true,
    supportsSleeves: true,
    supportsNeck: true,
  },
  {
    id: 5,
    title: "Unisex Cotton Crew Tee",
    brand: "Next Level",
    model: "3600",
    description: "Premium fitted, lightweight cotton tee with a modern fit.",
    printProviderId: DEFAULT_PRINT_PROVIDER_ID,
    printAreas: [
      { position: "front", width: 2767, height: 3136 },
      { position: "back", width: 2767, height: 3136 },
      { position: "neck", width: 750, height: 750 },
    ],
    supportsFront: true,
    supportsBack: true,
    supportsSleeves: false,
    supportsNeck: true,
  },
  {
    id: 36,
    title: "Unisex Ultra Cotton Tee",
    brand: "Gildan",
    model: "2000",
    description: "Medium weight, sustainable cotton tee. Pre-shrunk 100% cotton.",
    printProviderId: DEFAULT_PRINT_PROVIDER_ID,
    printAreas: [
      { position: "front", width: 3185, height: 3636 },
      { position: "back", width: 3185, height: 3636 },
    ],
    supportsFront: true,
    supportsBack: true,
    supportsSleeves: false,
    supportsNeck: false,
  },
  {
    id: 9,
    title: "Women's Favorite Tee",
    brand: "Bella+Canvas",
    model: "6004",
    description: "Feminine fitted cut with a relaxed feel.",
    printProviderId: DEFAULT_PRINT_PROVIDER_ID,
    printAreas: [
      { position: "front", width: 2452, height: 2789 },
      { position: "back", width: 2452, height: 2789 },
    ],
    supportsFront: true,
    supportsBack: true,
    supportsSleeves: false,
    supportsNeck: false,
  },
  {
    id: 41,
    title: "Unisex Jersey Long Sleeve Tee",
    brand: "Bella+Canvas",
    model: "3501",
    description: "Classic long sleeve tee with the same quality as the 3001.",
    printProviderId: DEFAULT_PRINT_PROVIDER_ID,
    printAreas: [
      { position: "front", width: 4200, height: 4795 },
      { position: "back", width: 4200, height: 4795 },
    ],
    supportsFront: true,
    supportsBack: true,
    supportsSleeves: false,
    supportsNeck: false,
  },
];

// Get blueprint by ID
export function getBlueprintById(id: number): Blueprint | undefined {
  return BLUEPRINTS.find((bp) => bp.id === id);
}

// Get all blueprints that support both front and back printing
export function getBlueprintsWithFrontBack(): Blueprint[] {
  return BLUEPRINTS.filter((bp) => bp.supportsFront && bp.supportsBack);
}

// Get print area dimensions for a specific position
export function getPrintAreaDimensions(
  blueprintId: number,
  position: string
): PrintArea | undefined {
  const blueprint = getBlueprintById(blueprintId);
  return blueprint?.printAreas.find((pa) => pa.position === position);
}

// Validate if a print position is supported
export function isPositionSupported(
  blueprintId: number,
  position: string
): boolean {
  const blueprint = getBlueprintById(blueprintId);
  return blueprint?.printAreas.some((pa) => pa.position === position) ?? false;
}
