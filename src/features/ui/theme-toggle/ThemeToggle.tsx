"use client";

import { Button } from "@/features/ui/button";
import { useState } from "react";
import { useThemeCycle } from "./useThemeCycle";

export function ThemeToggle() {
  const { currentTheme, Icon, cycleTheme, themes, theme, setTheme } = useThemeCycle();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={cycleTheme}
        className="relative h-9 w-9 px-0 hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-all duration-200"
        title={`Current: ${currentTheme.label}. Click to switch theme.`}
      >
        <Icon className="h-4 w-4 text-purple-600 dark:text-purple-400 transition-all duration-200" />
        <span className="sr-only">Toggle theme</span>
      </Button>

      {/* Optional: Theme selection tooltip */}
      {isOpen && (
        <div className="absolute right-0 top-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-1 z-50">
          {themes.map((themeOption) => {
            const ThemeIcon = themeOption.icon;
            return (
              <button
                key={themeOption.value}
                onClick={() => {
                  setTheme(themeOption.value);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  theme === themeOption.value ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" : ""
                }`}
              >
                <ThemeIcon className="h-4 w-4" />
                {themeOption.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}