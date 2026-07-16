"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PasswordResetForm } from "./passwordResetForm/PasswordResetForm";
import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";

interface PropsI {
  className?: string;
  buttonClassName?: string;
}

export function InlinePasswordReset({ className }: PropsI) {
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const t = useTranslations("auth.passwordReset.inline");

  const handleClose = () => {
    setShowPasswordReset(false);
  };

  return (
    <div className={className}>
      {/* Forgot password button */}
      <div className="flex justify-end">
        <Button
          type="button"
          variant="link"
          size="sm"
          className="h-auto p-0"
          onClick={() => setShowPasswordReset(!showPasswordReset)}
        >
          <Span
            variant="default"
            className="text-(--color-stamp-gold) hover:text-(--color-stamp-chocolate) hover:underline"
          >
            {t("forgotPassword")}
          </Span>
        </Button>
      </div>

      {/* Password reset form */}
      <PasswordResetForm isVisible={showPasswordReset} onClose={handleClose} />
    </div>
  );
}
