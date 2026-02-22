import { LucideIcon, Sparkles, Wand2, Image, Grid, Settings, Cog, User, Crown } from "lucide-react";

export interface IRouteHeaderConfig {
  leftIcon: LucideIcon;
  rightIcon: LucideIcon;
  leftIconColor: string;
  rightIconColor: string;
  title: string;
  subtitle: string;
}

export const ROUTE_HEADER_CONFIGS: Record<string, IRouteHeaderConfig> = {
  dashboard: {
    leftIcon: Sparkles,
    rightIcon: Wand2,
    leftIconColor: "text-slate-600",
    rightIconColor: "text-gray-600",
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