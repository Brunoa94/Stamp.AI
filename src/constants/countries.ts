/**
 * Country list with ISO 3166-1 alpha-2 codes and flag emojis
 * Organized by region for easier maintenance
 * Includes all major Printify shipping destinations
 */

export interface CountryOption {
  code: string;
  name: string;
  flag: string;
}

export const COUNTRIES: CountryOption[] = [
  // North America
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },

  // Europe - Western
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "IE", name: "Ireland", flag: "🇮🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "BE", name: "Belgium", flag: "🇧🇪" },
  { code: "LU", name: "Luxembourg", flag: "🇱🇺" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭" },
  { code: "AT", name: "Austria", flag: "🇦🇹" },

  // Europe - Northern
  { code: "SE", name: "Sweden", flag: "🇸🇪" },
  { code: "NO", name: "Norway", flag: "🇳🇴" },
  { code: "DK", name: "Denmark", flag: "🇩🇰" },
  { code: "FI", name: "Finland", flag: "🇫🇮" },
  { code: "IS", name: "Iceland", flag: "🇮🇸" },

  // Europe - Eastern
  { code: "PL", name: "Poland", flag: "🇵🇱" },
  { code: "CZ", name: "Czech Republic", flag: "🇨🇿" },
  { code: "SK", name: "Slovakia", flag: "🇸🇰" },
  { code: "HU", name: "Hungary", flag: "🇭🇺" },
  { code: "RO", name: "Romania", flag: "🇷🇴" },
  { code: "BG", name: "Bulgaria", flag: "🇧🇬" },
  { code: "HR", name: "Croatia", flag: "🇭🇷" },
  { code: "SI", name: "Slovenia", flag: "🇸🇮" },
  { code: "EE", name: "Estonia", flag: "🇪🇪" },
  { code: "LV", name: "Latvia", flag: "🇱🇻" },
  { code: "LT", name: "Lithuania", flag: "🇱🇹" },

  // Europe - Southern
  { code: "GR", name: "Greece", flag: "🇬🇷" },
  { code: "CY", name: "Cyprus", flag: "🇨🇾" },
  { code: "MT", name: "Malta", flag: "🇲🇹" },

  // Oceania
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿" },

  // Asia - East
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "TW", name: "Taiwan", flag: "🇹🇼" },
  { code: "HK", name: "Hong Kong", flag: "🇭🇰" },
  { code: "MO", name: "Macau", flag: "🇲🇴" },

  // Asia - Southeast
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾" },
  { code: "TH", name: "Thailand", flag: "🇹🇭" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩" },
  { code: "PH", name: "Philippines", flag: "🇵🇭" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳" },

  // Asia - South
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩" },
  { code: "LK", name: "Sri Lanka", flag: "🇱🇰" },

  // Middle East
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "IL", name: "Israel", flag: "🇮🇱" },
  { code: "TR", name: "Turkey", flag: "🇹🇷" },
  { code: "QA", name: "Qatar", flag: "🇶🇦" },
  { code: "KW", name: "Kuwait", flag: "🇰🇼" },
  { code: "BH", name: "Bahrain", flag: "🇧🇭" },
  { code: "OM", name: "Oman", flag: "🇴🇲" },
  { code: "JO", name: "Jordan", flag: "🇯🇴" },
  { code: "LB", name: "Lebanon", flag: "🇱🇧" },

  // South America
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "CL", name: "Chile", flag: "🇨🇱" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "PE", name: "Peru", flag: "🇵🇪" },
  { code: "UY", name: "Uruguay", flag: "🇺🇾" },
  { code: "VE", name: "Venezuela", flag: "🇻🇪" },
  { code: "EC", name: "Ecuador", flag: "🇪🇨" },

  // Central America & Caribbean
  { code: "CR", name: "Costa Rica", flag: "🇨🇷" },
  { code: "PA", name: "Panama", flag: "🇵🇦" },
  { code: "GT", name: "Guatemala", flag: "🇬🇹" },
  { code: "SV", name: "El Salvador", flag: "🇸🇻" },
  { code: "HN", name: "Honduras", flag: "🇭🇳" },
  { code: "NI", name: "Nicaragua", flag: "🇳🇮" },
  { code: "DO", name: "Dominican Republic", flag: "🇩🇴" },
  { code: "JM", name: "Jamaica", flag: "🇯🇲" },
  { code: "TT", name: "Trinidad and Tobago", flag: "🇹🇹" },
  { code: "BS", name: "Bahamas", flag: "🇧🇸" },

  // Africa
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "EG", name: "Egypt", flag: "🇪🇬" },
  { code: "MA", name: "Morocco", flag: "🇲🇦" },
  { code: "TN", name: "Tunisia", flag: "🇹🇳" },
  { code: "KE", name: "Kenya", flag: "🇰🇪" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "GH", name: "Ghana", flag: "🇬🇭" },
  { code: "ET", name: "Ethiopia", flag: "🇪🇹" },
  { code: "TZ", name: "Tanzania", flag: "🇹🇿" },
  { code: "UG", name: "Uganda", flag: "🇺🇬" },
];

/**
 * Format countries for select dropdown
 */
export function getCountrySelectOptions(): Array<{ value: string; label: string }> {
  return COUNTRIES.map((country) => ({
    value: country.code,
    label: `${country.flag} ${country.name}`,
  }));
}
