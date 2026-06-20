import { getColorClass } from "@/helpers/colors/colorMapping";

export const MAX_VISIBLE_COLORS = 10;

// Top 10 distinct popular colors - basics always included
const colorPriority: Record<string, number> = {
    // Basic essentials (1-4)
    black: 1,
    white: 2,
    gray: 3,
    grey: 3,
    navy: 4,
    "navy blue": 4,
    // Popular distinct colors (5-10)
    red: 5,
    blue: 6,
    green: 7,
    purple: 8,
    pink: 9,
    yellow: 10,
    // Additional colors (shown when expanded)
    orange: 11,
    brown: 12,
    "heather gray": 13,
    "heather grey": 13,
    maroon: 14,
    burgundy: 15,
    "royal blue": 16,
};

interface ColorOption {
  name: string;
  available: boolean;
}

interface Props{
    colors: ColorOption[];
    isExpanded: boolean;
}

interface Return{
    hasMore: boolean;
    visibleColors: ColorOption[];
    colorsLength: number;
}

export const getAvailableColors = ({colors, isExpanded}: Props): Return => {
    const filteredColors = colors.filter(
    (color) => getColorClass(color.name) !== null,
    );

    const availableColors = filteredColors.sort((a, b) => {
        const priorityA = colorPriority[a.name.toLowerCase()] || 999;
        const priorityB = colorPriority[b.name.toLowerCase()] || 999;

        if (priorityA !== priorityB) {
            return priorityA - priorityB;
        }

        return a.name.localeCompare(b.name);
    });

    return{
        hasMore: availableColors.length > MAX_VISIBLE_COLORS,
        colorsLength: availableColors.length,
        visibleColors: isExpanded
            ? availableColors
            : availableColors.slice(0, MAX_VISIBLE_COLORS)
    }
}
