"use client";

import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { theme } from "@/theme";
import { PageHeader } from "@/features/ui/page-header";
import { UserInformationSection } from "@/features/profile/sections/UserInformationSection";
import { PasswordResetSection } from "@/features/profile/sections/PasswordResetSection";
import { AddressSection } from "@/features/profile/sections/AddressSection";
import { User } from "lucide-react";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className={theme.page.background}>
        <div className={theme.page.container}>
          <div className="space-y-8">
            <PageHeader
              title="My Profile"
              subtitle="Manage your account settings and preferences"
              icon={User}
              align="center"
              variant="gradient"
            />

            <div className="space-y-6">
              <UserInformationSection />
              <PasswordResetSection />
              <AddressSection />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
