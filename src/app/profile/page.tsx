"use client";

import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { ProfileContent } from "@/features/profile/ui/ProfileContent";

export default function ProfilePage() {
  return (
    <div className="bg-concrete text-ink font-(family-name:--font-outfit) antialiased min-h-screen">
      <ProtectedRoute>
        <ProfileContent />
      </ProtectedRoute>
    </div>
  );
}
