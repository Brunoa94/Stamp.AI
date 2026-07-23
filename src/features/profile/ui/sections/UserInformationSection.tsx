"use client";

import { Button } from "@/features/ui/button";
import { Input } from "@/features/ui/input";
import { Label } from "@/features/ui/label";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { User, Save, X } from "lucide-react";
import { useUserInformation } from "@/features/profile/lib/hooks/useUserInformation";
import { useTranslations } from "next-intl";

// Static field configuration outside component for performance
const formFields = [
  {
    id: "first_name",
    key: "firstName" as const,
  },
  {
    id: "last_name",
    key: "lastName" as const,
  },
] as const;

export function UserInformationSection() {
  const t = useTranslations("profile.userInformation");
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
    <section className="bg-white border border-ink/10 p-8 lg:p-12 shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
      {/* Section Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex gap-5">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-100 rounded-2xl flex items-center justify-center text-slate-500">
            <User className="w-6 h-6" />
          </div>
          <div>
            <Heading
              as="h2"
              variant="cardCompact"
              className="text-xl text-ink mb-1"
            >
              {t("title")}
            </Heading>
            <Paragraph variant="sm" className="text-slate-500 text-sm">
              {t("subtitle")}
            </Paragraph>
          </div>
        </div>
        {!isEditing && (
          <Button
            onClick={handleStartEditing}
            variant="brutalist-ghost"
            className="text-[10px]"
          >
            {t("edit")}
          </Button>
        )}
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {formFields.map(({ id, key }) => (
          <div key={id} className="space-y-2">
            <Label htmlFor={id}>
              <Span variant="label" className="text-slate-400">
                {t(`${key}Label`)}
              </Span>
            </Label>
            <Input
              type="text"
              id={id}
              value={fieldValues[key]}
              onChange={(e) => fieldSetters[key](e.target.value)}
              readOnly={!isEditing}
              className="w-full bg-white border border-ink/10 p-4 font-heading uppercase placeholder:opacity-10 focus:border-brandCyan focus:ring-4 focus:ring-brandCyan/10 outline-none transition-all"
            />
          </div>
        ))}

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="email">
            <Span variant="label" className="text-slate-400">
              {t("emailLabel")}
            </Span>
          </Label>
          <Input
            type="email"
            id="email"
            value={email}
            readOnly
            className="w-full bg-concrete/30 border border-ink/10 p-4 font-heading uppercase outline-none"
          />
          <Paragraph variant="xs" className="text-slate-400 italic">
            {t("emailNote")}
          </Paragraph>
        </div>
      </div>

      {/* Action Buttons */}
      {isEditing && (
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-8 mt-8 border-t border-slate-200/50">
          <Button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
            variant="brutalist-primary"
            className="w-full sm:w-auto group"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? t("saving") : t("saveChanges")}
          </Button>
          <Button
            type="button"
            onClick={handleCancel}
            variant="brutalist-ghost"
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            <X className="w-4 h-4 mr-2" />
            {t("cancel")}
          </Button>
        </div>
      )}
    </section>
  );
}
