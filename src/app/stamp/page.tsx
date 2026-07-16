import { getTranslations } from "next-intl/server";
import { StampPage as StampMainPage } from "@/features/stamp/ui/StampPage";

/**
 * /stamp Route
 *
 * Luxury theme stamp customization flow.
 * 8-stage synthesis protocol for bespoke product creation.
 */

export async function generateMetadata() {
  const t = await getTranslations("stamp.metadata");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function StampPage() {
  return <StampMainPage />;
}
