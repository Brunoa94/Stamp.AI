"use client";

import { Button } from "@/features/ui/button";
import { Paragraph } from "@/features/ui/paragraph";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("auth.passwordReset.form");

  return (
    <div
      className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isVisible ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      }`}
    >
      <div className="pt-4 space-y-3 border-t border-(--color-stamp-divider)">
        <Paragraph variant="body" className="text-lg font-bold uppercase tracking-widest text-(--color-stamp-taupe)">
          {t("prompt")}
        </Paragraph>
        <div className="space-y-3">
          <input
            type="email"
            placeholder={t("emailPlaceholder")}
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
              variant="primary"
              disabled={isLoading || !resetEmail.trim()}
              className="flex-1 py-3"
              onClick={handlePasswordReset}
            >
              {isLoading ? t("sending") : t("sendResetLink")}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="py-3 px-6"
              onClick={handleClose}
            >
              {t("cancel")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}