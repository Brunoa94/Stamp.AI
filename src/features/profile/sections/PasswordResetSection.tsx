"use client";

import { Button } from "@/features/ui/button";
import { Input } from "@/features/ui/input";
import { Label } from "@/features/ui/label";
import { Lock } from "lucide-react";
import { usePasswordReset } from "../hooks/usePasswordReset";
import { profileTheme } from "@/theme";
import { ProfileSectionHeader } from "../components/ProfileSectionHeader";

// Static field configuration outside component for performance
const passwordFields = [
  {
    id: "new_password",
    label: "New Password",
    placeholder: "Enter new password",
    hint: "Password must be at least 6 characters",
    key: "newPassword" as const,
  },
  {
    id: "confirm_password",
    label: "Confirm New Password",
    placeholder: "Confirm new password",
    hint: "Re-enter your new password",
    key: "confirmPassword" as const,
  },
] as const;

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

  const fieldSetters = {
    newPassword: setNewPassword,
    confirmPassword: setConfirmPassword,
  } as const;

  const fieldValues = {
    newPassword,
    confirmPassword,
  } as const;

  return (
    <section className={profileTheme.section.card}>
      <ProfileSectionHeader
        icon={Lock}
        title="Password & Security"
        subtitle="Update your password to keep your account secure"
        buttonText="Change Password"
        isEditing={isEditing}
        onEdit={handleStartEditing}
      />

      {/* Content */}
      {!isEditing ? (
        <p className={profileTheme.password.description}>
          Your password is hidden for security. Click "Change Password" to
          update it.
        </p>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          {passwordFields.map(({ id, label, placeholder, hint, key }) => (
            <div key={id} className={profileTheme.personalInfo.fieldWrap}>
              <Label
                htmlFor={id}
                className={profileTheme.personalInfo.label}
              >
                {label}
              </Label>
              <Input
                type="password"
                id={id}
                value={fieldValues[key]}
                onChange={(e) => fieldSetters[key](e.target.value)}
                placeholder={placeholder}
                className={profileTheme.personalInfo.input}
                autoComplete="new-password"
              />
              <p className={profileTheme.personalInfo.hint}>{hint}</p>
            </div>
          ))}

          <div className="flex items-center gap-3 pt-4">
            <Button
              type="submit"
              disabled={!canSubmit || isLoading}
              className="bg-linear-to-r from-[#7C3AED] to-[#06B6D4] text-white font-bold uppercase tracking-widest text-xs px-6 py-2"
            >
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
            <Button
              type="button"
              onClick={handleCancel}
              variant="ghost"
              disabled={isLoading}
              className="border border-slate-200 text-slate-600 font-bold uppercase tracking-widest text-xs px-6 py-2"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
