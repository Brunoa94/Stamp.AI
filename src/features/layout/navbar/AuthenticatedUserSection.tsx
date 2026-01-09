import { Button } from "@/features/ui/button";
import { useLogout } from "@/hooks/useAuth";
import Link from "next/link";
import { User, LogOut, Sparkles } from "lucide-react";
import { UserI } from "@/types/index";
import { colors } from "@/theme";

interface PropsI {
  user: UserI;
}

export function AuthenticatedUserSection({ user }: PropsI) {
  const logoutMutation = useLogout();

  const handleSignOut = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="flex items-center gap-4">
      {/* Welcome message */}
      <div className="hidden sm:flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
        <span className={`text-sm font-medium ${colors.textGradient}`}>
          Welcome, {user.user_metadata?.first_name || user.email?.split('@')[0]}
        </span>
      </div>

      {/* Dashboard button */}
      <Button asChild size="sm" className="bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105">
        <Link href="/dashboard">
          <User className="mr-2 h-4 w-4" />
          Dashboard
        </Link>
      </Button>

      {/* Logout button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleSignOut}
        disabled={logoutMutation.isPending}
        className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-300 hover:scale-105"
      >
        <LogOut className="mr-2 h-4 w-4" />
        {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
      </Button>
    </div>
  );
}
