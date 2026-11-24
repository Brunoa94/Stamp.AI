import type { ReactNode } from "react";
import { SplitToneText } from "./SplitToneText";

/**
 * StampTitleAccent
 *
 * The handwritten accent word of a studio step title (Indie Flower, amber
 * text on the off-white, amber-light on the backdrop photo). Padding with a
 * matching negative margin keeps the italic overhangs painted when split.
 */

interface PropsI {
  children: ReactNode;
}

export function StampTitleAccent({ children }: PropsI) {
  return (
    <SplitToneText
      tone="accent"
      className="inline-block pb-4 -mb-4 pr-2 -mr-2 font-serif italic lowercase font-light"
    >
      {children}
    </SplitToneText>
  );
}
