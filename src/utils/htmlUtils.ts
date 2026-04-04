/**
 * Strips HTML tags from a string and returns clean text
 */
export const stripHtmlTags = (html: string): string => {
  if (!html) return '';

  // Remove HTML tags
  const text = html.replace(/<[^>]*>/g, ' ');

  // Replace multiple spaces with single space
  const cleaned = text.replace(/\s+/g, ' ').trim();

  return cleaned;
};

/**
 * Truncates text to a specified length and adds ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;

  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Strips HTML and truncates text
 */
export const cleanAndTruncate = (html: string, maxLength: number = 150): string => {
  const cleanText = stripHtmlTags(html);
  return truncateText(cleanText, maxLength);
};

/**
 * Maps technical feature names to user-friendly descriptions
 */
export const mapFeatureToDescription = (feature: string): string => {
  const featureMap: Record<string, string> = {
    'front': 'Can be printed on the front',
    'back': 'Can be printed on the back',
  };

  return featureMap[feature.toLowerCase()] || feature;
};
