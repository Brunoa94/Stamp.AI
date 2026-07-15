"use client";

import { Button } from "@/features/ui/button";
import { usePasswordResetForm } from "./usePasswordResetForm";

interface PasswordResetFormProps {
  isVisible: boolean;
  onClose: () => void;
}

export function PasswordResetForm({ isVisible, onClose }: PasswordResetFormProps) {
  const {
    resetEmail,
    setResetEmail,
    handlePasswordReset,
    handleClose,
    isLoading,
  } = usePasswordResetForm({ onClose });

  return (
    <div
      className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isVisible ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      }`}
    >
      <div className="pt-4 space-y-3 border-t border-(--color-stamp-divider)">
        <p className="text-lg font-bold uppercase tracking-widest text-(--color-stamp-taupe)">
          Enter your email to reset your password
        </p>
        <div className="space-y-3">
          <input
            type="email"
            placeholder="Enter your email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            className="w-full px-4 py-3 border-2 border-(--color-stamp-divider) bg-(--color-stamp-cream) text-xl uppercase tracking-[0.05em] text-(--color-stamp-chocolate) placeholder:text-(--color-stamp-taupe)/50 focus:outline-none focus:border-(--color-stamp-gold) focus:ring-2 focus:ring-(--color-stamp-gold)/20"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handlePasswordReset(e as unknown as React.MouseEvent);
              }
            }}
          />
          <div className="flex gap-3">
            <Button
              type="button"
              variant="stamp-auth-primary"
              disabled={isLoading || !resetEmail.trim()}
              className="flex-1 py-3"
              onClick={handlePasswordReset}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>
            <Button
              type="button"
              variant="stamp-auth-cancel"
              className="py-3 px-6"
              onClick={handleClose}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}