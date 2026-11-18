import { staticAssetUrl } from "@/shared/helpers/staticAssetUrl";

const MOCK_IMAGE_PATH = "/zoe.png";

/** The local-development stand-in for a generated image (zoe.png on the static-assets CDN), as a PNG data URL */
export async function loadMockImageDataUrl(): Promise<string> {
  const url = staticAssetUrl(MOCK_IMAGE_PATH);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Mock image ${MOCK_IMAGE_PATH} could not be loaded from ${url}: HTTP ${response.status}`);
  }
  const base64 = Buffer.from(await response.arrayBuffer()).toString("base64");
  return `data:image/png;base64,${base64}`;
}
