"use client";

import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { theme } from "@/theme";
import { ProfileContent } from "@/features/profile/ProfileContent";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <main className={theme.page.container}>
        <ProfileContent />
      </main>
    </ProtectedRoute>
  );
}
