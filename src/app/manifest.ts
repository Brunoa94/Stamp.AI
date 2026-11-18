import type { MetadataRoute } from "next";
import { staticAssetUrl } from "@/shared/helpers/staticAssetUrl";

/** Web app manifest, served at /manifest.webmanifest; the touch icon lives on the static-assets CDN */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Stamp AI",
    short_name: "Stamp AI",
    description:
      "Type a prompt or upload your own photo, then put it on good t-shirts, hoodies, and prints built to last.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0a0a0a",
    icons: [
      { src: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { src: staticAssetUrl("/apple-touch-icon.png"), sizes: "180x180", type: "image/png" },
    ],
    categories: ["shopping", "lifestyle"],
    orientation: "portrait-primary",
  };
}
