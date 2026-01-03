"use client";

import { useUser, useSession, useLogout } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";

interface SessionDisplayProps {
  className?: string;
}

export function SessionDisplay({ className }: SessionDisplayProps) {
  const { data: user, isLoading: userLoading, error: userError } = useUser();
  const { data: session, isLoading: sessionLoading } = useSession();
  const logoutMutation = useLogout();

  if (userLoading || sessionLoading) {
    return <div className="animate-pulse">Loading session...</div>;
  }

  if (userError) {
    return <div className="text-red-500">Error loading session</div>;
  }

  if (!user) {
    return <div>No user session</div>;
  }

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Session Information</h2>
        <Button
          onClick={handleLogout}
          variant="outline"
          disabled={logoutMutation.isPending}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          {logoutMutation.isPending ? "Signing out..." : "Sign out"}
        </Button>
      </div>

      <div className="grid gap-4">
        {/* User Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <User className="h-4 w-4" />
            User Information
          </h3>
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">ID:</span> {user.id}</div>
            <div><span className="font-medium">Email:</span> {user.email}</div>
            {user.user_metadata?.first_name && (
              <div><span className="font-medium">First Name:</span> {user.user_metadata.first_name}</div>
            )}
            {user.user_metadata?.last_name && (
              <div><span className="font-medium">Last Name:</span> {user.user_metadata.last_name}</div>
            )}
            <div><span className="font-medium">Created At:</span> {new Date(user.created_at).toLocaleDateString()}</div>
            {user.email_confirmed_at && (
              <div><span className="font-medium">Email Confirmed:</span> {new Date(user.email_confirmed_at).toLocaleDateString()}</div>
            )}
            {user.last_sign_in_at && (
              <div><span className="font-medium">Last Sign In:</span> {new Date(user.last_sign_in_at).toLocaleDateString()}</div>
            )}
          </div>
        </div>

        {/* Session Information */}
        {session && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium mb-3">Session Details</h3>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Token Type:</span> {session.token_type}</div>
              <div><span className="font-medium">Expires At:</span> {new Date(session.expires_at * 1000).toLocaleString()}</div>
              <div><span className="font-medium">Expires In:</span> {Math.floor(session.expires_in / 60)} minutes</div>
            </div>
          </div>
        )}

        {/* Raw Data */}
        <details className="bg-gray-50 rounded-lg p-4">
          <summary className="font-medium cursor-pointer">Raw Session Data</summary>
          <pre className="text-xs bg-white p-3 rounded border overflow-auto mt-2">
            {JSON.stringify({ user, session }, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}