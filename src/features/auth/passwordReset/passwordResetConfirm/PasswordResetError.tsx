import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export function PasswordResetError() {
  return (
    <div className="text-center space-y-6">
      <div className="text-(--color-stamp-error) mb-4">
        <AlertCircle className="w-16 h-16 mx-auto" strokeWidth={1.5} />
      </div>
      <Heading
        as="h3"
        variant="card"
        className="text-2xl tracking-tight text-(--color-stamp-chocolate)"
      >
        Reset Link Invalid
      </Heading>
      <Paragraph variant="sm" className="text-(--color-stamp-taupe)">
        This password reset link is invalid or has expired. Please request a new
        one.
      </Paragraph>
      <Button asChild variant="stamp-auth-cancel">
        <Link href="/">Back to Home</Link>
      </Button>
    </div>
  );
}
