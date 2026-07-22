import type { Metadata } from "next";
import { PAGE_METADATA_CONFIGS } from "@/features/seo/metadata";
import ProfilePageClient from "./ProfilePageClient";

/**
 * /profile Route - User Profile Settings
 *
 * Protected route for managing account settings and shipping addresses.
 * SEO: noindex (user-specific content)
 */

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
