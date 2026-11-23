"use client";

import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { ProfileContent } from "@/features/profile/ui/ProfileContent";

export default function ProfilePageClient() {
  return (
    <div className="min-h-screen bg-(--color-stamp-off-white) text-(--color-stamp-chocolate) antialiased">
      <ProtectedRoute>
        <ProfileContent />
      </ProtectedRoute>
    </div>
  );
}
