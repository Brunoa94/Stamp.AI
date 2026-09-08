import type { Metadata } from "next";
import ProfilePageClient from "./ProfilePageClient";

export const metadata: Metadata = {
  title: "My Profile",
  description: "Manage your account settings, shipping addresses, and preferences.",
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return <ProfilePageClient />;
}
