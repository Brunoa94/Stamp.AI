interface ProcessOrbitalTransform {
  translateX: number;
  translateY: number;
  translateZ: number;
  rotateY: number;
  scale: number;
  opacity: number;
  blur: number;
  zIndex: number;
}

interface ProcessOrbitalPalette {
  accent: string;
  glow: string;
  giantNumber: string;
  bar: string;
}

function roundTo(value: number, decimals = 4): number {
  const factor = 10 ** decimals;

  return Math.round(value * factor) / factor;
}

const ORBITAL_PALETTES: readonly ProcessOrbitalPalette[] = [
  {
    accent: "from-[#7C3AED]/50 via-[#D946EF]/25 to-transparent",
    glow: "bg-[#7C3AED]/16",
    giantNumber: "text-[#7C3AED]/80",
    bar: "from-[#7C3AED] via-[#D946EF] to-[#06B6D4]",
  },
  {
    accent: "from-[#06B6D4]/50 via-[#22D3EE]/25 to-transparent",
    glow: "bg-[#06B6D4]/18",
    giantNumber: "text-[#06B6D4]/80",
    bar: "from-[#06B6D4] via-[#22D3EE] to-[#7C3AED]",
  },
  {
    accent: "from-[#FF8C42]/45 via-[#F59E0B]/20 to-transparent",
    glow: "bg-[#FF8C42]/20",
    giantNumber: "text-[#FF8C42]/80",
    bar: "from-[#FF8C42] via-[#F59E0B] to-[#7C3AED]",
  },
  {
    accent: "from-[#4F46E5]/50 via-[#06B6D4]/25 to-transparent",
    glow: "bg-[#4F46E5]/18",
    giantNumber: "text-[#4F46E5]/80",
    bar: "from-[#4F46E5] via-[#06B6D4] to-[#22D3EE]",
  },
  {
    accent: "from-[#D946EF]/45 via-[#7C3AED]/25 to-transparent",
    glow: "bg-[#D946EF]/18",
    giantNumber: "text-[#D946EF]/80",
    bar: "from-[#D946EF] via-[#7C3AED] to-[#A855F7]",
  },
  {
    accent: "from-[#06B6D4]/45 via-[#FF8C42]/24 to-transparent",
    glow: "bg-[#14B8A6]/18",
    giantNumber: "text-[#14B8A6]/80",
    bar: "from-[#06B6D4] via-[#14B8A6] to-[#FF8C42]",
  },
] as const;

export function mapProcessStepIndexToOrbitalPalette(index: number): ProcessOrbitalPalette {
  const safeIndex =
    ((index % ORBITAL_PALETTES.length) + ORBITAL_PALETTES.length) %
    ORBITAL_PALETTES.length;

  return ORBITAL_PALETTES[safeIndex];
}

export function mapProcessStepIndexToOrbitalTransform(
  index: number,
  activeProcessStep: number,
): ProcessOrbitalTransform {
  const delta = index - activeProcessStep;
  const absDelta = Math.abs(delta);
  const clampedDelta = Math.min(absDelta, 4);

  const horizontalSpacing = 420;
  const translateX = delta * horizontalSpacing;
  const translateY = roundTo(Math.sin(delta * 0.5) * 62);
  const translateZ = 320 - clampedDelta * 220;
  const rotateY = delta * -14;
  const scale = roundTo(Math.max(0.7, 1 - clampedDelta * 0.1));
  const opacity = roundTo(Math.max(0.3, 1 - clampedDelta * 0.2));
  const blur = roundTo(Math.max(0, clampedDelta * 1.8));
  const zIndex = Math.max(1, 80 - clampedDelta * 10);

  return {
    translateX,
    translateY,
    translateZ,
    rotateY,
    scale,
    opacity,
    blur,
    zIndex,
  };
}
