"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { usePasswordResetRequest } from "@/hooks/useAuth";

interface PasswordResetFormProps {
  isVisible: boolean;
  onClose: () => void;
}

export function PasswordResetForm({ isVisible, onClose }: PasswordResetFormProps) {
  const [resetEmail, setResetEmail] = useState("");
  const passwordResetMutation = usePasswordResetRequest();

  const handlePasswordReset = async (
    e?: React.FormEvent | React.MouseEvent
  ) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!resetEmail.trim()) return;

    passwordResetMutation.mutate({ email: resetEmail });
    onClose();
    setResetEmail("");
  };

  const handleClose = () => {
    onClose();
    setResetEmail("");
  };

  return (
    <div
      className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isVisible ? "max-h-32 opacity-100" : "max-h-0 opacity-0"
      }`}
    >
      <div className="pt-2 space-y-3 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Enter your email to reset your password
        </p>
        <div className="space-y-3">
          <input
            type="email"
            placeholder="Enter your email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handlePasswordReset(e as any);
              }
            }}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              disabled={passwordResetMutation.isPending || !resetEmail.trim()}
              className="flex-1"
              onClick={handlePasswordReset}
            >
              {passwordResetMutation.isPending
                ? "Sending..."
                : "Send Reset Link"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
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