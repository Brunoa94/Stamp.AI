"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthService } from "@/services/authService";
import type {
  LoginI,
  PasswordResetRequestI,
  RegisterI,
  UpdateProfileI,
} from "@/schemas/auth";
import { AuthResponseI, UserI } from "@/types/api";
import { useRouter } from "next/navigation";
import { useErrorHandler } from "@/hooks/useErrorHandler";

// Query keys
export const authKeys = {
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
 * Get current session
 */
export function useSession() {
  return useQuery({
    queryKey: authKeys.session(),
    queryFn: AuthService.getSession,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Check if user is authenticated
 */
export function useIsAuthenticated() {
  const { data: user, isLoading } = useUser();
  return {
    isAuthenticated: !!user,
    isLoading,
  };
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
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation({
    mutationFn: (credentials: LoginI): Promise<AuthResponseI> => {
      return AuthService.login(credentials);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.user(), data.user);
      queryClient.setQueryData(authKeys.session(), data.session);

      handleSuccess("Login successful - Welcome back!");

      router.push("/stamp");
    },
    onError: (error: Error) => {
      handleError(error);
    },
  });
}

/**
 * User registration
 */
export function useRegister() {
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation({
    mutationFn: (userData: RegisterI): Promise<AuthResponseI> => {
      return AuthService.register(userData);
    },
    onSuccess: (data) => {
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

      handleSuccess("Logged out successfully");

      router.push("/stamp");
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
 * Resend email verification
 */
export function useResendEmailVerification() {
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation({
    mutationFn: (email: string): Promise<void> => {
      return AuthService.resendEmailVerification(email);
    },
    onSuccess: () => {
      handleSuccess("Verification email sent - Please check your email.");
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
