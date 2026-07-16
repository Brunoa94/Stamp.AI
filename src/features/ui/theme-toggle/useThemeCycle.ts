import { useTheme } from "@/hooks/useTheme";
import { useTranslations } from "next-intl";
import { Sun, Moon, Monitor } from "lucide-react";

export function useThemeCycle() {
  const { theme, setTheme } = useTheme();
  const t = useTranslations("ui.themeToggle.themes");

  const themes = [
    { value: "light", label: t("light"), icon: Sun },
    { value: "dark", label: t("dark"), icon: Moon },
    { value: "system", label: t("system"), icon: Monitor },
  ] as const;

  // Handle undefined theme during SSR or initial load
  const currentTheme = themes.find(item => item.value === theme) || themes[2];
  const Icon = currentTheme.icon;

  const cycleTheme = () => {
    const currentIndex = themes.findIndex(item => item.value === theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex].value);
  };

  return {
    themes,
    currentTheme,
    Icon,
    cycleTheme,
    theme: theme || "system",
    setTheme
  };
}