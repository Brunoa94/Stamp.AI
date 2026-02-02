"use client";

import { Button } from "@/features/ui/button";
import { Input } from "@/features/ui/input";
import { Label } from "@/features/ui/label";
import { User, Save, X } from "lucide-react";
import { useUserInformation } from "../hooks/useUserInformation";

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

  return (
    <section
      className="bg-white dark:bg-gray-800 border-2 border-purple-200 dark:border-purple-700 rounded-2xl p-6 space-y-6"
      aria-labelledby="personal-info-heading"
    >
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg"
            aria-hidden="true"
          >
            <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2
              id="personal-info-heading"
              className="text-xl font-bold text-gray-900 dark:text-gray-100"
            >
              Personal Information
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Update your personal details
            </p>
          </div>
        </div>
        {!isEditing && (
          <Button
            onClick={handleStartEditing}
            variant="outline"
            className="border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-300 dark:hover:bg-purple-900/20"
            aria-label="Edit personal information"
          >
            Edit
          </Button>
        )}
      </header>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (isEditing) {
            handleSave();
          }
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={!isEditing || isLoading}
              className="disabled:opacity-50 disabled:cursor-not-allowed"
              aria-readonly={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={!isEditing || isLoading}
              className="disabled:opacity-50 disabled:cursor-not-allowed"
              aria-readonly={!isEditing}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            disabled
            className="disabled:opacity-50 disabled:cursor-not-allowed bg-gray-50 dark:bg-gray-900"
            aria-describedby="email_hint"
            aria-readonly="true"
          />
          <p
            id="email_hint"
            className="text-xs text-gray-500 dark:text-gray-400"
          >
            Email cannot be changed for security reasons
          </p>
        </div>

        {isEditing && (
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              <Save className="w-4 h-4 mr-2" aria-hidden="true" />
              {isLoading ? "Saving..." : "Save Changes"}
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
        )}
      </form>
    </section>
  );
}
