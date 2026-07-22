import type { Metadata } from "next";
import { PAGE_METADATA_CONFIGS } from "@/features/seo/metadata/pageConfigs";
import ProfilePageClient from "./ProfilePageClient";

export const metadata: Metadata = {
  title: PAGE_METADATA_CONFIGS.profile.title,
  description: PAGE_METADATA_CONFIGS.profile.description,
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProfilePage() {
  return <ProfilePageClient />;
}
