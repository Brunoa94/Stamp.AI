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
      variant="outline"
      className={`w-full gap-3 rounded-xl border-slate-200 bg-white py-6 font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md ${className ?? ""}`}
      onClick={() => signInWithGoogle()}
      disabled={isPending}
    >
      <Image src="/assets/google-icon.svg" alt="Google" width={18} height={18} />
      {isPending ? "Connecting..." : "Continue with Google"}
    </Button>
  );
}
