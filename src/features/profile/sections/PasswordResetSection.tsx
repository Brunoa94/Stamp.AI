"use client";

import { Button } from "@/features/ui/button";
import { PasswordInput } from "@/features/ui/password-input";
import { Lock, Save, X } from "lucide-react";
import { usePasswordReset } from "../hooks/usePasswordReset";

export function PasswordResetSection() {
  const {
    isEditing,
    newPassword,
    confirmPassword,
    isLoading,
    canSubmit,
    handleSave,
    handleCancel,
    handleStartEditing,
    setNewPassword,
    setConfirmPassword,
  } = usePasswordReset();

  return (
    <section
      className="bg-white dark:bg-gray-800 border-2 border-purple-200 dark:border-purple-700 rounded-2xl p-6 space-y-6"
      aria-labelledby="password-security-heading"
    >
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg"
            aria-hidden="true"
          >
            <Lock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2
              id="password-security-heading"
              className="text-xl font-bold text-gray-900 dark:text-gray-100"
            >
              Password & Security
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Update your password to keep your account secure
            </p>
          </div>
        </div>
        {!isEditing && (
          <Button
            onClick={handleStartEditing}
            variant="outline"
            className="border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-300 dark:hover:bg-purple-900/20"
            aria-label="Change password"
          >
            Change Password
          </Button>
        )}
      </header>

      {isEditing ? (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <PasswordInput
            id="new_password"
            label="New Password"
            value={newPassword}
            onChange={setNewPassword}
            placeholder="Enter new password"
            required
            disabled={isLoading}
            hint="Password must be at least 6 characters"
            autoComplete="new-password"
          />

          <PasswordInput
            id="confirm_password"
            label="Confirm New Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Confirm new password"
            required
            disabled={isLoading}
            hint="Re-enter your new password"
            autoComplete="new-password"
          />

          <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="submit"
              disabled={!canSubmit || isLoading}
              className="bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              <Save className="w-4 h-4 mr-2" aria-hidden="true" />
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
            <Button
              type="button"
              onClick={handleCancel}
              variant="outline"
              disabled={isLoading}
            >
              <X className="w-4 h-4 mr-2" aria-hidden="true" />
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Your password is hidden for security. Click "Change Password" to update it.
        </p>
      )}
    </section>
  );
}
