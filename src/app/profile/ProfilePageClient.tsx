"use client";

import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { ProfileContent } from "@/features/profile/ui/ProfileContent";

export default function ProfilePageClient() {
  return (
    <div className="bg-concrete text-ink antialiased min-h-screen">
      <ProtectedRoute>
        <ProfileContent />
      </ProtectedRoute>
    </div>
  );
}
