"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
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
      variant="stamp-auth-google"
      className={className}
      onClick={() => signInWithGoogle()}
      disabled={isPending}
    >
      <Image src="/assets/google-icon.svg" alt={t("iconAlt")} width={20} height={20} />
      <span className="tracking-widest hover:text-(--color-stamp-chocolate) transition-colors">
        {isPending ? t("connecting") : t("continueWithGoogle")}
      </span>
    </Button>
  );
}
