/**
 * resolvePrintAreas
 *
 * Pure helper that maps the client's requested print areas onto the
 * positions the blueprint actually offers. Extracted from
 * create-custom-product/index.ts so it can be unit-tested (no Deno imports).
 *
 * Fallback behavior (regression fix): older/unknowing clients send
 * `{ front: imageId }` for every product, but some blueprints have no
 * "front" placeholder at all (e.g. socks only offer left_leg/right_leg).
 * When none of the requested positions exist on the blueprint, the first
 * provided image is applied to ALL available positions instead of failing —
 * for socks that prints both legs, matching the "let the server decide"
 * intent of clients that skip placement adjustment.
 */

export interface ResolvedPrintAreasI {
  /** position -> Printify image id, only for positions the blueprint offers */
  areas: Record<string, string>;
  /** Set when the fallback kicked in: which requested position was remapped */
  remappedFrom: string | null;
  /** Requested positions that were dropped (not offered by the blueprint) */
  droppedPositions: string[];
}

export function resolvePrintAreas(
  printAreas: unknown,
  legacyImageId: string | undefined,
  availablePositions: string[],
): ResolvedPrintAreasI {
  const areas: Record<string, string> = {};
  const droppedPositions: string[] = [];
  const provided: Array<[position: string, imageId: string]> = [];

  if (printAreas && typeof printAreas === "object" && !Array.isArray(printAreas)) {
    for (const [position, imageId] of Object.entries(
      printAreas as Record<string, unknown>,
    )) {
      if (!imageId || typeof imageId !== "string") continue;
      provided.push([position, imageId]);
      if (availablePositions.includes(position)) {
        areas[position] = imageId;
      } else {
        droppedPositions.push(position);
      }
    }
  } else if (legacyImageId && typeof legacyImageId === "string") {
    provided.push(["front", legacyImageId]);
    if (availablePositions.includes("front")) {
      areas.front = legacyImageId;
    } else {
      droppedPositions.push("front");
    }
  }

  // Fallback: every requested position was unavailable but we DID get an
  // image — print it on all the positions the product actually offers.
  if (
    Object.keys(areas).length === 0 &&
    provided.length > 0 &&
    availablePositions.length > 0
  ) {
    const [requestedPosition, imageId] = provided[0];
    for (const position of availablePositions) {
      areas[position] = imageId;
    }
    return { areas, remappedFrom: requestedPosition, droppedPositions };
  }

  return { areas, remappedFrom: null, droppedPositions };
}
