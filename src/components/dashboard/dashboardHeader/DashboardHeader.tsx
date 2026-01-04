"use client";

import { theme } from "@/theme";
import { LucideIcon, Sparkles, Wand2, Image, Grid, Settings, Cog, User, Crown } from "lucide-react";

interface IRouteHeaderConfig {
  leftIcon: LucideIcon;
  rightIcon: LucideIcon;
  leftIconColor: string;
  rightIconColor: string;
  title: string;
  subtitle: string;
}

const ROUTE_HEADER_CONFIGS: Record<string, IRouteHeaderConfig> = {
  dashboard: {
    leftIcon: Sparkles,
    rightIcon: Wand2,
    leftIconColor: "text-purple-500",
    rightIconColor: "text-pink-500",
    title: "AI Magic Studio",
    subtitle: "Transform your images with the power of AI creativity ✨"
  },
  gallery: {
    leftIcon: Image,
    rightIcon: Grid,
    leftIconColor: "text-blue-500",
    rightIconColor: "text-green-500",
    title: "Image Gallery",
    subtitle: "Browse and manage your AI-generated masterpieces 🎨"
  },
  settings: {
    leftIcon: Settings,
    rightIcon: Cog,
    leftIconColor: "text-gray-500",
    rightIconColor: "text-slate-500",
    title: "Settings",
    subtitle: "Customize your AI experience and preferences ⚙️"
  },
  profile: {
    leftIcon: User,
    rightIcon: Crown,
    leftIconColor: "text-amber-500",
    rightIconColor: "text-yellow-500",
    title: "Profile",
    subtitle: "Manage your account and AI generation history 👤"
  }
};

interface IDashboardHeaderProps {
  route: keyof typeof ROUTE_HEADER_CONFIGS;
}

const DashboardHeader = ({ route }: IDashboardHeaderProps) => {
  const config = ROUTE_HEADER_CONFIGS[route];
  const { leftIcon: LeftIcon, rightIcon: RightIcon, leftIconColor, rightIconColor, title, subtitle } = config;
  return (
    <header className={theme.dashboard.header}>
      <div className="flex items-center justify-center mb-6">
        {LeftIcon && (
          <LeftIcon className={`w-8 h-8 ${leftIconColor} mr-3 animate-[wiggle_0.8s_ease-in-out_infinite]`} />
        )}
        <h1 className={theme.dashboard.title}>
          {title}
        </h1>
        {RightIcon && (
          <RightIcon className={`w-8 h-8 ${rightIconColor} ml-3 animate-[float_3s_ease-in-out_infinite]`} />
        )}
      </div>
      <p className={theme.dashboard.subtitle}>
        {subtitle}
      </p>
    </header>
  );
};

export default DashboardHeader;