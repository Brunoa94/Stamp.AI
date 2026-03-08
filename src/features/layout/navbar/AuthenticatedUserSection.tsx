"use client";

import { Button } from "@/features/ui/button";
import { useLogout } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Moon, User, ShoppingCart } from "lucide-react";
import { useTheme } from "next-themes";
import clsx from "clsx";
import { navbarTheme } from "@/theme/components";

export function AuthenticatedUserSection() {
  const logoutMutation = useLogout();
  const router = useRouter();
  const { setTheme, theme } = useTheme();

  const handleSignOut = () => {
    logoutMutation.mutate();
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className={navbarTheme.actions.container}>
      <Button
        onClick={toggleTheme}
        variant="ghost"
        size="icon"
        className={navbarTheme.actions.themeButton}
        aria-label="Toggle theme"
      >
        <Moon className="w-5 h-5" />
      </Button>

      <Button
        onClick={() => router.push("/cart")}
        variant="ghost"
        size="icon"
        className={navbarTheme.actions.themeButton}
        aria-label="View cart"
      >
        <ShoppingCart className="w-5 h-5" />
      </Button>

      <div className={navbarTheme.actions.divider} />

      <Button
        onClick={() => router.push("/profile")}
        variant="ghost"
        size="icon"
        className={navbarTheme.actions.profileButton}
        aria-label="View profile"
      >
        <div className={navbarTheme.actions.profileIcon}>
          <User className="w-5 h-5" />
        </div>
      </Button>

      <Button
        onClick={handleSignOut}
        disabled={logoutMutation.isPending}
        variant="destructive"
        className={clsx(
          navbarTheme.actions.signOutButton,
          logoutMutation.isPending && "opacity-50 cursor-not-allowed",
        )}
      >
        {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
      </Button>
    </div>
  );
}
