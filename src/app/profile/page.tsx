"use client";

import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { theme } from "@/theme";
import { UserInformationSection } from "@/features/profile/sections/UserInformationSection";
import { PasswordResetSection } from "@/features/profile/sections/PasswordResetSection";
import { AddressSection } from "@/features/profile/sections/AddressSection";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className={theme.page.background}>
        <div className={theme.page.container}>
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className={theme.dashboard.title}>My Profile</h1>
              <p className={theme.dashboard.subtitle}>
                Manage your account settings and preferences
              </p>
            </div>

            {/* Profile Sections */}
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
