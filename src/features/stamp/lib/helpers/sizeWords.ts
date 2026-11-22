/** The words in a formatted size that are not language-neutral */
export type SizeWordsT = {
  oneSize: string;
  vertical: string;
  horizontal: string;
};

/**
 * Swaps the English words formatSizeForDisplay produces ("One Size",
 * "(Vertical)", "(Horizontal)") for the visitor's language. Everything
 * else it produces (S/M/L, cl, cm) is language-neutral.
 */
export function translateSizeWords(formattedSize: string, words: SizeWordsT): string {
  if (formattedSize === "One Size") return words.oneSize;

  return formattedSize
    .replace(/\(Vertical\)$/, `(${words.vertical})`)
    .replace(/\(Horizontal\)$/, `(${words.horizontal})`);
}
