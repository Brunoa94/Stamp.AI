"use client";

import { ReactNode, useEffect } from "react";
import { ThemeContext, useThemeState } from "@/hooks/useTheme";

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const themeState = useThemeState();

  // Prevent flash of wrong theme on initial load
  useEffect(() => {
    // Remove any SSR classes that might conflict
    document.documentElement.classList.remove("light", "dark");

    // Apply the resolved theme immediately
    document.documentElement.classList.add(themeState.resolvedTheme);
  }, [themeState.resolvedTheme]);

  return (
    <ThemeContext.Provider value={themeState}>
      {children}
    </ThemeContext.Provider>
  );
}