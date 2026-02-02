/**
 * Maps color names to Tailwind CSS background color classes
 * @param colorName - The name of the color to map
 * @returns The corresponding Tailwind CSS class string, or null if no mapping exists
 */
export const getColorClass = (colorName: string): string | null => {
  const lowerColor = colorName.toLowerCase().trim();

  const colorMap: Record<string, string> = {
    // Basic colors
    black: "bg-black",
    white: "bg-white border-gray-400",
    red: "bg-red-600",
    blue: "bg-blue-600",
    navy: "bg-blue-950",
    "navy blue": "bg-blue-950",
    green: "bg-green-600",
    yellow: "bg-yellow-400",
    orange: "bg-orange-600",
    purple: "bg-purple-600",
    pink: "bg-pink-500",
    gray: "bg-gray-500",
    grey: "bg-gray-500",
    brown: "bg-amber-800",
    beige: "bg-amber-100 border-amber-300",
    tan: "bg-yellow-700",

    // Dark variations
    "dark red": "bg-red-900",
    "dark blue": "bg-blue-900",
    "dark green": "bg-green-900",
    "dark gray": "bg-gray-700",
    "dark grey": "bg-gray-700",
    maroon: "bg-red-950",
    burgundy: "bg-red-900",

    // Light variations
    "light blue": "bg-blue-300",
    "light pink": "bg-pink-300",
    "light gray": "bg-gray-300",
    "light grey": "bg-gray-300",
    "light green": "bg-green-300",

    // Heather/mixed
    heather: "bg-gray-400",
    "heather gray": "bg-gray-400",
    "heather grey": "bg-gray-400",
    "heather blue": "bg-blue-400",
    "heather green": "bg-green-400",

    // Additional common colors
    royal: "bg-blue-700",
    "royal blue": "bg-blue-700",
    teal: "bg-teal-600",
    cyan: "bg-cyan-500",
    indigo: "bg-indigo-600",
    violet: "bg-violet-600",
    lime: "bg-lime-500",
    mint: "bg-emerald-300",
    olive: "bg-yellow-800",
    gold: "bg-yellow-500",
    silver: "bg-gray-400",
    cream: "bg-amber-50 border-amber-200",
    ivory: "bg-yellow-50 border-yellow-200",
    charcoal: "bg-gray-800",
    slate: "bg-slate-600",
    khaki: "bg-yellow-600",
    coral: "bg-orange-400",
    salmon: "bg-orange-300",
    peach: "bg-orange-200",
    lavender: "bg-purple-300",
    mauve: "bg-purple-400",
    plum: "bg-purple-700",
    magenta: "bg-fuchsia-600",
    crimson: "bg-red-700",
    scarlet: "bg-red-600",
    emerald: "bg-emerald-600",
    forest: "bg-green-800",
    "forest green": "bg-green-800",
    turquoise: "bg-teal-400",
    aqua: "bg-cyan-400",
    sage: "bg-green-400",
  };

  // Try exact match first
  if (colorMap[lowerColor]) {
    return colorMap[lowerColor];
  }

  // Try partial matches for compound color names
  for (const [key, value] of Object.entries(colorMap)) {
    if (lowerColor.includes(key) || key.includes(lowerColor)) {
      return value;
    }
  }

  // Return null for unknown colors
  return null;
};
