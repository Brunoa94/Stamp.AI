"use client";

import Image from "next/image";
import { Button } from "@/features/ui/button";
import { useGoogleSignIn } from "@/queries/authQueries";

interface GoogleSignInButtonProps {
  className?: string;
}

export function GoogleSignInButton({ className }: GoogleSignInButtonProps) {
  const { mutate: signInWithGoogle, isPending } = useGoogleSignIn();

  return (
    <Button
      type="button"
      variant="stamp-auth-google"
      className={className}
      onClick={() => signInWithGoogle()}
      disabled={isPending}
    >
      <Image src="/assets/google-icon.svg" alt="Google" width={20} height={20} />
      <span className="tracking-widest hover:text-(--color-stamp-chocolate) transition-colors">
        {isPending ? "Connecting..." : "Continue with Google"}
      </span>
    </Button>
  );
}
