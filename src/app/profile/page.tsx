import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { generatePageMetadata } from "@/features/seo/metadata/pageMetadata";
import ProfilePageClient from "./ProfilePageClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("profile.meta");

  // /profile is in NOINDEX_PATHS, so generatePageMetadata marks it noindex.
  return generatePageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/profile",
  });
}

export default function ProfilePage() {
  return <ProfilePageClient />;
}
