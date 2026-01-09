"use client";

import { useState } from "react";
import { PasswordResetForm } from "./passwordResetForm/PasswordResetForm";
import { Button } from "@/features/ui/button";

export function InlinePasswordReset() {
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  const handleClose = () => {
    setShowPasswordReset(false);
  };

  return (
    <div>
      {/* Forgot password button */}
      <div className="flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-sm p-2 h-auto"
          onClick={() => setShowPasswordReset(!showPasswordReset)}
        >
          Forgot password?
        </Button>
      </div>

      {/* Password reset form */}
      <PasswordResetForm isVisible={showPasswordReset} onClose={handleClose} />
    </div>
  );
}
