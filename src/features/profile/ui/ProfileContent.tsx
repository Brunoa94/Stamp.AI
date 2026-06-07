"use client";

import { PageHeader } from "@/features/ui/page-header";
import { UserInformationSection } from "@/features/profile/ui/sections/UserInformationSection";
import { PasswordResetSection } from "@/features/profile/ui/sections/PasswordResetSection";
import { AddressSection } from "@/features/profile/ui/sections/AddressSection";

export function ProfileContent() {
  return (
    <>
      <PageHeader
        title="My Profile"
        description="Manage your account settings and preferences"
      />

      <div className="space-y-8">
        <UserInformationSection />
        <PasswordResetSection />
        <AddressSection />
      </div>
    </>
  );
}
