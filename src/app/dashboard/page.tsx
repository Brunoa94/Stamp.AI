"use client";

import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { theme } from "@/theme";
import { useUser } from "@/hooks/useAuth";
import {
  CreateDesignCard,
  ViewOrdersCard,
  ProfileCard,
} from "@/features/dashboard/quickActions";
import { SettingsPopup } from "@/features/dashboard/SettingsPopup";
import { Settings } from "lucide-react";
import { useState } from "react";
import { Button } from "@/features/ui/button";
import { PageHeader } from "@/features/ui/page-header";

export default function DashboardPage() {
  const { data: user } = useUser();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className={theme.page.background}>
        <div className={theme.page.container}>
          <div className="space-y-8">
            {/* Header */}
            <PageHeader
              title={`Welcome Back, ${user?.user_metadata?.first_name || "Creator"}!`}
              subtitle={"Your creative dashboard"}
            />
            {/* Highlighted Create Design Card */}
            <div className="transform scale-105">
              <CreateDesignCard />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ViewOrdersCard />
              <ProfileCard />
            </div>
          </div>

          {/* Settings Button - Bottom Right */}
          <Button
            onClick={() => setIsSettingsOpen(true)}
            className="fixed bottom-8 right-8 bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-4 rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-110 z-40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            aria-label="Open settings"
          >
            <Settings className="w-6 h-6 animate-spin-slow" />
          </Button>

          {/* Settings Popup */}
          <SettingsPopup
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
