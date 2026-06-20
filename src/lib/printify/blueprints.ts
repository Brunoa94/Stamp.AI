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
// Only includes blueprints that exist in provider_catalog table
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
    id: 145,
    title: "Unisex Softstyle T-Shirt",
    brand: "Gildan",
    model: "64000",
    description: "Soft and comfortable unisex t-shirt with a modern fit.",
    printProviderId: DEFAULT_PRINT_PROVIDER_ID,
    printAreas: [
      { position: "front", width: 2767, height: 3362 },
      { position: "back", width: 2767, height: 3362 },
    ],
    supportsFront: true,
    supportsBack: true,
    supportsSleeves: false,
    supportsNeck: false,
  },
  {
    id: 157,
    title: "Kids Heavy Cotton™ Tee",
    brand: "Gildan",
    model: "5000B",
    description: "Classic kids cotton tee with the same quality as adult sizes.",
    printProviderId: DEFAULT_PRINT_PROVIDER_ID,
    printAreas: [
      { position: "front", width: 2767, height: 3136 },
      { position: "back", width: 2767, height: 3136 },
    ],
    supportsFront: true,
    supportsBack: true,
    supportsSleeves: false,
    supportsNeck: false,
  },
  {
    id: 553,
    title: "Cotton Tote Bag",
    brand: "Generic",
    model: "Tote",
    description: "Durable cotton tote bag with custom printing.",
    printProviderId: DEFAULT_PRINT_PROVIDER_ID,
    printAreas: [
      { position: "front", width: 3185, height: 3636 },
    ],
    supportsFront: true,
    supportsBack: false,
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
