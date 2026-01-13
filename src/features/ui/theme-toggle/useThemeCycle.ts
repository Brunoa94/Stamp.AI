import { useTheme } from "@/hooks/useTheme";
import { Sun, Moon, Monitor } from "lucide-react";

export function useThemeCycle() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ] as const;

  // Handle undefined theme during SSR or initial load
  const currentTheme = themes.find(t => t.value === theme) || themes[2];
  const Icon = currentTheme.icon;

  const cycleTheme = () => {
    const currentIndex = themes.findIndex(t => t.value === theme);
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