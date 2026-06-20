"use client";

import { UserInformationSection } from "@/features/profile/ui/sections/UserInformationSection";
import { PasswordResetSection } from "@/features/profile/ui/sections/PasswordResetSection";
import { AddressSection } from "@/features/profile/ui/sections/AddressSection";
import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";

export function ProfileContent() {
  return (
    <div className="min-h-screen flex flex-col relative z-10">
      <div className="flex-1 px-6 lg:px-12 xl:px-24">
        <PageContainer>
          <div className="space-y-12">
            <PageHeader
              title="My"
              highlightedWord="Profile"
              subtitle="Manage your account settings"
            />

            {/* Sections */}
            <div className="space-y-8">
              <UserInformationSection />
              <PasswordResetSection />
              <AddressSection />
            </div>
          </div>
        </PageContainer>
      </div>
    </div>
  );
}
