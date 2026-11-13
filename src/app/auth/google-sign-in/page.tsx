import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { GoogleSignInRedirect } from "@/features/auth/ui/components/GoogleSignInRedirect";
import { generatePageMetadata } from "@/features/seo/metadata/pageMetadata";
import { ROUTE_SEO } from "@/features/seo/config/routes";

/**
 * /auth/google-sign-in Route - Google sign-in fallback
 *
 * The auth callback sends a guest here when the Google account they tried to
 * link already belongs to a user; this page starts a normal Google sign-in.
 * SEO: noindex (utility page)
 */

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.google.meta");

  return generatePageMetadata({
    title: t("title"),
    description: t("description"),
    path: ROUTE_SEO.googleSignIn.path,
    noindex: true,
  });
}

export default function GoogleSignInPage() {
  return <GoogleSignInRedirect />;
}
