const FAQ_CARD_GRADIENTS = [
  "from-white/90 via-[#7C3AED]/8 to-[#06B6D4]/10",
  "from-white/90 via-[#06B6D4]/8 to-[#7C3AED]/10",
  "from-white/90 via-[#FF8C42]/8 to-[#7C3AED]/10",
] as const;

export function mapFaqIndexToGradient(index: number): string {
  const safeIndex = ((index % FAQ_CARD_GRADIENTS.length) + FAQ_CARD_GRADIENTS.length) %
    FAQ_CARD_GRADIENTS.length;

  return FAQ_CARD_GRADIENTS[safeIndex];
}
