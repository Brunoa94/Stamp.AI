import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/useAuth";
import Link from "next/link";
import { User, LogOut } from "lucide-react";
import { UserI } from "@/types/index";

interface PropsI {
  user: UserI;
}

export function AuthenticatedUserSection({ user }: PropsI) {
  const logoutMutation = useLogout();

  const handleSignOut = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600">
        Welcome, {user.user_metadata?.first_name || user.email}
      </span>
      <Button asChild variant="outline" size="sm">
        <Link href="/dashboard">
          <User className="mr-2 h-4 w-4" />
          Dashboard
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSignOut}
        disabled={logoutMutation.isPending}
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <LogOut className="mr-2 h-4 w-4" />
        {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
      </Button>
    </div>
  );
}
