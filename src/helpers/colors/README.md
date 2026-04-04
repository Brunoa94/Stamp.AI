# Color Helpers

This folder contains utility functions for working with colors throughout the application.

## Functions

### `getColorClass(colorName: string): string | null`

Maps color names to their corresponding Tailwind CSS background color classes.

**Parameters:**
- `colorName` - The name of the color (e.g., "red", "navy blue", "heather gray")

**Returns:**
- A string containing the Tailwind CSS class(es) for the color
- `null` if no mapping exists for the given color name

**Features:**
- Case-insensitive matching
- Supports exact matches and partial matches for compound color names
- Includes 80+ color mappings covering basic colors, dark/light variations, and specialty colors

**Example:**
```typescript
import { getColorClass } from "@/helpers/colors";

const colorClass = getColorClass("navy blue");
// Returns: "bg-blue-950"

const unknownColor = getColorClass("neon-pink");
// Returns: null
```

## Usage

This helper is used throughout the application for:
- Product color selection (ColorSelector component)
- Product detail displays (ProductDetailsModal)
- Any UI component that needs to display product colors
