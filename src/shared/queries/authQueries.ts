"use client";

import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthService } from "@/shared/services/authService";
import type {
  LoginI,
  PasswordResetRequestI,
  RegisterI,
  UpdateProfileI,
} from "@/shared/schemas/auth";
import { AuthResponseI, UserI } from "../../../supabase/types";
import { useRouter } from "next/navigation";
import { useErrorHandler } from "@/shared/hooks/useErrorHandler";
import { AnalyticsService } from "@/shared/services/analyticsService";
import { isRegisteredUser } from "@/shared/helpers/authIdentity";
import {
  getSafeRedirectPath,
  REDIRECTED_FROM_PARAM,
} from "@/shared/helpers/redirectTarget";

// Query keys
const authKeys = {
  all: ["auth"] as const,
  user: () => [...authKeys.all, "user"] as const,
  session: () => [...authKeys.all, "session"] as const,
};

// ============================================
// QUERIES (Read Operations)
// ============================================

/**
 * Get current user
 */
export function useUser() {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: AuthService.getUser,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Check if user is registered. Guests with an anonymous session count as
 * logged out.
 */
export function useIsAuthenticated() {
  const { data: user, isLoading } = useUser();
  return {
    isAuthenticated: isRegisteredUser(user),
    isLoading,
  };
}

/**
 * Returns a function that resolves to the current user, starting an
 * anonymous (guest) session first when there is none. Call it just before
 * the first server call that needs an identity, so visitors who only browse
 * never create an auth user.
 */
export function useEnsureGuestSession() {
  const queryClient = useQueryClient();

  return useCallback(async (): Promise<UserI> => {
    const current = await AuthService.getUser();
    if (current) return current;

    const guest = await AuthService.signInAsGuest();
    queryClient.setQueryData(authKeys.user(), guest);
    return guest;
  }, [queryClient]);
}

// ============================================
// MUTATIONS (Write Operations)
// ============================================

/**
 * User login
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { handleSuccess } = useErrorHandler();

  return useMutation({
    mutationFn: (
      { credentials, captchaToken }: {
        credentials: LoginI;
        captchaToken?: string | null;
      },
    ): Promise<AuthResponseI> => {
      return AuthService.login(credentials, captchaToken ?? undefined);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.user(), data.user);
      queryClient.setQueryData(authKeys.session(), data.session);

      // Invalidate coins query so new user's coins are fetched
      queryClient.invalidateQueries({ queryKey: ["coins"] });

      handleSuccess("Login successful - Welcome back!");

      // Continue to the protected page the guest was bounced from, if any;
      // otherwise go to the studio unless the user is already there.
      // A full navigation is required: while the visitor was a guest the
      // router prefetched protected links and cached the middleware's
      // redirect to "/", and a client-side push can replay that redirect.
      const redirectTarget =
        typeof window !== "undefined"
          ? getSafeRedirectPath(
              new URLSearchParams(window.location.search).get(REDIRECTED_FROM_PARAM),
            )
          : null;

      // A full navigation would drop the in-flight analytics hit, so those
      // branches hand the login event to the next page.
      if (redirectTarget) {
        AnalyticsService.trackAfterNavigation("login", { method: "email" });
        window.location.assign(redirectTarget);
      } else if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/stamp")
      ) {
        AnalyticsService.trackAfterNavigation("login", { method: "email" });
        window.location.assign("/stamp");
      } else {
        AnalyticsService.track("login", { method: "email" });
        // Force a refresh of the current page state
        router.refresh();
      }
    },
  });
}

/**
 * User registration
 */
export function useRegister() {
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation({
    mutationFn: (
      { userData, captchaToken }: {
        userData: RegisterI;
        captchaToken?: string | null;
      },
    ): Promise<AuthResponseI> => {
      return AuthService.register(userData, captchaToken);
    },
    onSuccess: (data) => {
      AnalyticsService.track("sign_up", { method: "email" });

      handleSuccess(
        `Registration successful - ${
          data.message || "Please check your email to verify your account."
        }`,
      );
    },
    onError: (error: Error) => {
      handleError(error);
    },
  });
}

/**
 * User logout
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation({
    mutationFn: AuthService.logout,
    onMutate: () => {
      // Optimistic auth update so UI switches immediately
      queryClient.setQueryData(authKeys.user(), null);
      queryClient.setQueryData(authKeys.session(), null);
    },
    onSuccess: () => {
      queryClient.clear();
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
      queryClient.invalidateQueries({ queryKey: authKeys.session() });
      queryClient.removeQueries({ queryKey: authKeys.all });

      AnalyticsService.track("logout");

      handleSuccess("Logged out successfully");

      router.push("/");
    },
    onError: (error: Error) => {
      handleError(error);
      // Restore canonical state if sign-out failed
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
      queryClient.invalidateQueries({ queryKey: authKeys.session() });
    },
  });
}

/**
 * Password reset request
 */
export function usePasswordResetRequest() {
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation({
    mutationFn: (data: PasswordResetRequestI): Promise<void> => {
      return AuthService.requestPasswordReset(data);
    },
    onSuccess: () => {
      handleSuccess(
        "Password reset email sent - Please check your email for reset instructions.",
      );
    },
    onError: (error: Error) => {
      handleError(error);
    },
  });
}

/**
 * Update user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation({
    mutationFn: (data: UpdateProfileI): Promise<UserI> => {
      return AuthService.updateProfile(data);
    },
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.user(), user);

      handleSuccess("Profile updated successfully");
    },
    onError: (error: Error) => {
      handleError(error);
    },
  });
}

/**
 * Update user password
 */
export function useUpdatePassword() {
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation({
    mutationFn: (newPassword: string) =>
      AuthService.updatePassword(newPassword),
    onSuccess: () => {
      handleSuccess("Password updated successfully");
    },
    onError: (error: Error) => {
      handleError(error);
    },
  });
}

/**
 * Sign in with Google OAuth
 */
export function useGoogleSignIn() {
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: (): Promise<void> => {
      return AuthService.signInWithGoogle();
    },
    onError: (error: Error) => {
      handleError(error);
    },
  });
}
