"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";
import { useGoogleSignIn } from "@/queries/authQueries";

interface GoogleSignInButtonProps {
  className?: string;
}

export function GoogleSignInButton({ className }: GoogleSignInButtonProps) {
  const { mutate: signInWithGoogle, isPending } = useGoogleSignIn();
  const t = useTranslations("auth.google");

  return (
    <Button
      type="button"
      variant="stamp-google"
      className={className}
      onClick={() => signInWithGoogle()}
      disabled={isPending}
      trackingId="login"
      trackingData={{ method: "google" }}
    >
      <Image src="/assets/google-icon.svg" alt={t("iconAlt")} width={20} height={20} />
      <Span variant="default" className="tracking-widest hover:text-(--color-stamp-chocolate) transition-colors">
        {isPending ? t("connecting") : t("continueWithGoogle")}
      </Span>
    </Button>
  );
}
