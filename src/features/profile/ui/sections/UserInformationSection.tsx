"use client";

import { Button } from "@/features/ui/button";
import { Input } from "@/features/ui/input";
import { Label } from "@/features/ui/label";
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
            <h2 className="text-xl font-anton uppercase tracking-tight text-ink leading-tight mb-1">
              {t("title")}
            </h2>
            <p className="text-slate-500 text-sm">{t("subtitle")}</p>
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
            <Label
              htmlFor={id}
              className="text-[10px] font-bold uppercase tracking-widest text-slate-400"
            >
              {t(`${key}Label`)}
            </Label>
            <Input
              type="text"
              id={id}
              value={fieldValues[key]}
              onChange={(e) => fieldSetters[key](e.target.value)}
              readOnly={!isEditing}
              className="w-full bg-white border border-ink/10 p-4 font-space uppercase placeholder:opacity-10 focus:border-brandCyan focus:ring-4 focus:ring-brandCyan/10 outline-none transition-all"
            />
          </div>
        ))}

        <div className="md:col-span-2 space-y-2">
          <Label
            htmlFor="email"
            className="text-[10px] font-bold uppercase tracking-widest text-slate-400"
          >
            {t("emailLabel")}
          </Label>
          <Input
            type="email"
            id="email"
            value={email}
            readOnly
            className="w-full bg-concrete/30 border border-ink/10 p-4 font-space uppercase outline-none"
          />
          <p className="text-[11px] text-slate-400 font-medium italic">
            {t("emailNote")}
          </p>
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
