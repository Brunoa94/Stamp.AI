"use client";

import { Button } from "@/features/ui/button";
import { Input } from "@/features/ui/input";
import { Label } from "@/features/ui/label";
import { User } from "lucide-react";
import { useUserInformation } from "@/features/profile/lib/hooks/useUserInformation";
import { profileTheme } from "@/theme";
import { ProfileSectionHeader } from "../components/ProfileSectionHeader";

// Static field configuration outside component for performance
const formFields = [
  {
    id: "first_name",
    label: "First Name",
    key: "firstName" as const,
  },
  {
    id: "last_name",
    label: "Last Name",
    key: "lastName" as const,
  },
] as const;

export function UserInformationSection() {
  const {
    isEditing,
    firstName,
    lastName,
    email,
    isLoading,
    handleSave,
    handleCancel,
    handleStartEditing,
    setFirstName,
    setLastName,
  } = useUserInformation();

  const fieldSetters = {
    firstName: setFirstName,
    lastName: setLastName,
  } as const;

  const fieldValues = {
    firstName,
    lastName,
  } as const;

  return (
    <section className={profileTheme.section.card}>
      <ProfileSectionHeader
        icon={User}
        title="Personal Information"
        subtitle="Update your personal details"
        buttonText="Edit"
        isEditing={isEditing}
        onEdit={handleStartEditing}
      />

      {/* Form Fields */}
      <div className={profileTheme.personalInfo.grid}>
        {formFields.map(({ id, label, key }) => (
          <div key={id} className={profileTheme.personalInfo.fieldWrap}>
            <Label
              htmlFor={id}
              className={profileTheme.personalInfo.label}
            >
              {label}
            </Label>
            <Input
              type="text"
              id={id}
              value={fieldValues[key]}
              onChange={(e) => fieldSetters[key](e.target.value)}
              readOnly={!isEditing}
              className={profileTheme.personalInfo.input}
            />
          </div>
        ))}

        <div className={profileTheme.personalInfo.fullWidth}>
          <Label
            htmlFor="email"
            className={profileTheme.personalInfo.label}
          >
            Email
          </Label>
          <Input
            type="email"
            id="email"
            value={email}
            readOnly
            className={`${profileTheme.personalInfo.input} ${profileTheme.personalInfo.inputReadonly}`}
          />
          <p className={profileTheme.personalInfo.hint}>
            Email cannot be changed for security reasons
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      {isEditing && (
        <div className="flex items-center gap-3 pt-6">
          <Button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
            className="bg-linear-to-r from-[#7C3AED] to-[#06B6D4] text-white font-bold uppercase tracking-widest text-xs px-6 py-2"
          >
            {isLoading ? "Saving..." : "Save Changes"}
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
      )}
    </section>
  );
}
