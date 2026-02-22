"use client";

import { Button } from "@/features/ui/button";
import { useState, useEffect } from "react";
import { useThemeCycle } from "./useThemeCycle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/features/ui/dropdown-menu";
import clsx from "clsx";

export function ThemeToggle() {
  const { currentTheme, Icon, themes, theme, setTheme } = useThemeCycle();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering theme-dependent content after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="relative h-9 w-9 px-0"
        disabled
        aria-label="Loading theme"
      >
        <span className="sr-only">Loading theme</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-9 w-9 px-0 hover:bg-slate-100 dark:hover:bg-slate-900/20 transition-all duration-200"
          aria-label={`Current theme: ${currentTheme.label}. Click to change theme.`}
        >
          <Icon className="h-4 w-4 text-slate-600 dark:text-slate-400 transition-all duration-200" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-[160px]">
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          {themes.map((themeOption) => {
            const ThemeIcon = themeOption.icon;
            return (
              <DropdownMenuRadioItem
                key={themeOption.value}
                value={themeOption.value}
                className={clsx("flex items-center gap-2 cursor-pointer", {
                  "text-slate-600 dark:text-slate-400":
                    theme === themeOption.value,
                })}
              >
                <ThemeIcon className="h-4 w-4" />
                {themeOption.label}
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
