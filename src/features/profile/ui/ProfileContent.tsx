"use client";

import { UserInformationSection } from "@/features/profile/ui/sections/UserInformationSection";
import { PasswordResetSection } from "@/features/profile/ui/sections/PasswordResetSection";
import { AddressSection } from "@/features/profile/ui/sections/AddressSection";
import { ProfileLayout } from "./components/ProfileLayout";
import { ProfileHeader } from "./components/ProfileHeader";

export function ProfileContent() {
  return (
    <ProfileLayout header={<ProfileHeader />}>
      <UserInformationSection />
      <PasswordResetSection />
      <AddressSection />
    </ProfileLayout>
  );
}
