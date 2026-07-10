import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export function PasswordResetSuccess() {
  return (
    <div className="text-center space-y-6">
      <div className="text-(--color-stamp-success) mb-4">
        <CheckCircle className="w-16 h-16 mx-auto" strokeWidth={1.5} />
      </div>
      <Heading
        as="h3"
        variant="card"
        className="text-2xl tracking-tight text-(--color-stamp-chocolate)"
      >
        Password Reset Successful!
      </Heading>
      <Paragraph variant="sm" className="text-(--color-stamp-taupe)">
        Your password has been reset successfully. You will be redirected to the
        login page in 3 seconds.
      </Paragraph>
      <Button asChild variant="stamp-auth-primary" className="mt-4">
        <Link href="/">Go to Login</Link>
      </Button>
    </div>
  );
}
