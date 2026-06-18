"use client";

import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { PageContainer } from "@/shared/ui/PageContainer";
import { ProfileContent } from "@/features/profile/ui/ProfileContent";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <section className="relative z-10 px-8 lg:px-24">
        <PageContainer>
          <ProfileContent />
        </PageContainer>
      </section>
    </ProtectedRoute>
  );
}
