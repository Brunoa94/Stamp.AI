import type { Metadata } from "next";
import { GoogleSignInRedirect } from "@/features/auth/ui/components/GoogleSignInRedirect";

/**
 * /auth/google-sign-in Route - Google sign-in fallback
 *
 * The auth callback sends a guest here when the Google account they tried to
 * link already belongs to a user; this page starts a normal Google sign-in.
 * SEO: noindex (utility page)
 */

export const metadata: Metadata = {
  title: "Signing in with Google",
  description: "Redirecting you to Google to sign in to your account.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function GoogleSignInPage() {
  return <GoogleSignInRedirect />;
}
