import type { Metadata } from "next";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { ProfileContent } from "@/features/profile/ui/ProfileContent";

export const metadata: Metadata = {
  title: "My Profile | Stamp AI",
  description: "Manage your account settings, shipping addresses, and preferences.",
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return (
    <div className="bg-concrete text-ink font-heading antialiased min-h-screen">
      <ProtectedRoute>
        <ProfileContent />
      </ProtectedRoute>
    </div>
  );
}
