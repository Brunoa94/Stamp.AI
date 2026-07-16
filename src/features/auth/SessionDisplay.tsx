"use client";

import { useUser, useSession, useLogout } from "@/hooks/useAuth";
import { User, LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "../ui/button";

interface SessionDisplayProps {
  className?: string;
}

export function SessionDisplay({ className }: SessionDisplayProps) {
  const { data: user, isLoading: userLoading, error: userError } = useUser();
  const { data: session, isLoading: sessionLoading } = useSession();
  const logoutMutation = useLogout();
  const t = useTranslations("auth.sessionDisplay");

  if (userLoading || sessionLoading) {
    return <div className="animate-pulse">{t("loadingSession")}</div>;
  }

  if (userError) {
    return <div className="text-red-500">{t("errorLoadingSession")}</div>;
  }

  if (!user) {
    return <div>{t("noUserSession")}</div>;
  }

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("sessionInformation")}</h2>
        <Button
          onClick={handleLogout}
          variant="outline"
          disabled={logoutMutation.isPending}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          {logoutMutation.isPending ? t("signingOut") : t("signOut")}
        </Button>
      </div>

      <div className="grid gap-4">
        {/* User Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <User className="h-4 w-4" />
            {t("userInformation")}
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">{t("idLabel")}</span> {user.id}
            </div>
            <div>
              <span className="font-medium">{t("emailLabel")}</span> {user.email}
            </div>
            {user.user_metadata?.first_name && (
              <div>
                <span className="font-medium">{t("firstNameLabel")}</span>{" "}
                {user.user_metadata.first_name}
              </div>
            )}
            {user.user_metadata?.last_name && (
              <div>
                <span className="font-medium">{t("lastNameLabel")}</span>{" "}
                {user.user_metadata.last_name}
              </div>
            )}
            <div>
              <span className="font-medium">{t("createdAtLabel")}</span>{" "}
              {new Date(user.created_at).toLocaleDateString()}
            </div>
            {user.email_confirmed_at && (
              <div>
                <span className="font-medium">{t("emailConfirmedLabel")}</span>{" "}
                {new Date(user.email_confirmed_at).toLocaleDateString()}
              </div>
            )}
            {user.last_sign_in_at && (
              <div>
                <span className="font-medium">{t("lastSignInLabel")}</span>{" "}
                {new Date(user.last_sign_in_at).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        {/* Session Information */}
        {session && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium mb-3">{t("sessionDetails")}</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">{t("tokenTypeLabel")}</span>{" "}
                {session.token_type}
              </div>
              <div>
                <span className="font-medium">{t("expiresAtLabel")}</span>{" "}
                {new Date(session.expires_at * 1000).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">{t("expiresInLabel")}</span>{" "}
                {t("expiresInMinutes", {
                  minutes: Math.floor(session.expires_in / 60),
                })}
              </div>
            </div>
          </div>
        )}

        {/* Raw Data */}
        <details className="bg-gray-50 rounded-lg p-4">
          <summary className="font-medium cursor-pointer">
            {t("rawSessionData")}
          </summary>
          <pre className="text-xs bg-white p-3 rounded border overflow-auto mt-2">
            {JSON.stringify({ user, session }, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
