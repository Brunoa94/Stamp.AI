import type { Metadata } from "next";
import { PAGE_METADATA_CONFIGS } from "@/features/seo/metadata";
import DashboardPageClient from "./DashboardPageClient";

/**
 * /dashboard Route - User Dashboard
 *
 * Protected route for viewing saved designs and account overview.
 * SEO: noindex (user-specific content)
 */

export const metadata: Metadata = {
  title: PAGE_METADATA_CONFIGS.dashboard.title,
  description: PAGE_METADATA_CONFIGS.dashboard.description,
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardPage() {
  return <DashboardPageClient />;
}
