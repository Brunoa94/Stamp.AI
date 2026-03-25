import { getColorClass } from "@/helpers/colors/colorMapping";

export const MAX_VISIBLE_COLORS = 11;
const colorPriority: Record<string, number> = {
    black: 1,
    white: 2,
    navy: 3,
    "navy blue": 3,
    gray: 4,
    grey: 4,
    "heather gray": 5,
    "heather grey": 5,
    red: 6,
    blue: 7,
    "royal blue": 8,
    green: 9,
    purple: 10,
    pink: 11,
    yellow: 12,
    orange: 13,
    brown: 14,
    maroon: 15,
    burgundy: 16,
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
