import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthService } from "@/services/authService";
import type { LoginI, RegisterI, PasswordResetRequestI, UpdateProfileI } from "@/schemas/auth";
import type { UserI, SessionI, AuthResponseI } from "../../types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  session: () => [...authKeys.all, 'session'] as const,
};

/**
 * Hook to get current user
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
 * Hook to get current session
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
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated() {
  const { data: user, isLoading } = useUser();
  return {
    isAuthenticated: !!user,
    isLoading,
  };
}

/**
 * Hook for user login
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (credentials: LoginI): Promise<AuthResponseI> => {
      return AuthService.login(credentials);
    },
    onSuccess: (data) => {
      // Update cache
      queryClient.setQueryData(authKeys.user(), data.user);
      queryClient.setQueryData(authKeys.session(), data.session);

      toast.success("Login successful", {
        description: "Welcome back!",
        duration: 3000,
      });

      // Redirect to dashboard
      router.push("/dashboard");
    },
    onError: (error: Error) => {
      toast.error("Login failed", {
        description: error.message,
        duration: 5000,
      });
    },
  });
}

/**
 * Hook for user registration
 */
export function useRegister() {
  return useMutation({
    mutationFn: (userData: RegisterI): Promise<AuthResponseI> => {
      return AuthService.register(userData);
    },
    onSuccess: (data) => {
      toast.success("Registration successful", {
        description: data.message || "Please check your email to verify your account.",
        duration: 5000,
      });
    },
    onError: (error: Error) => {
      toast.error("Registration failed", {
        description: error.message,
        duration: 5000,
      });
    },
  });
}

/**
 * Hook for user logout
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: AuthService.logout,
    onSuccess: () => {
      // Set auth data to null before clearing cache to prevent undefined errors
      queryClient.setQueryData(authKeys.user(), null);
      queryClient.setQueryData(authKeys.session(), null);

      // Then clear all auth-related cache
      queryClient.removeQueries({ queryKey: authKeys.all });

      toast.success("Logged out successfully", {
        duration: 3000,
      });

      // Redirect to home
      router.push("/");
    },
    onError: (error: Error) => {
      toast.error("Logout failed", {
        description: error.message,
        duration: 5000,
      });
    },
  });
}

/**
 * Hook for password reset request
 */
export function usePasswordResetRequest() {
  return useMutation({
    mutationFn: (data: PasswordResetRequestI): Promise<void> => {
      return AuthService.requestPasswordReset(data);
    },
    onSuccess: () => {
      toast.success("Password reset email sent", {
        description: "Please check your email for reset instructions.",
        duration: 5000,
      });
    },
    onError: (error: Error) => {
      toast.error("Password reset failed", {
        description: error.message,
        duration: 5000,
      });
    },
  });
}

/**
 * Hook for profile update
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileI): Promise<UserI> => {
      return AuthService.updateProfile(data);
    },
    onSuccess: (user) => {
      // Update user cache
      queryClient.setQueryData(authKeys.user(), user);

      toast.success("Profile updated successfully", {
        duration: 3000,
      });
    },
    onError: (error: Error) => {
      toast.error("Profile update failed", {
        description: error.message,
        duration: 5000,
      });
    },
  });
}

/**
 * Hook for resending email verification
 */
export function useResendEmailVerification() {
  return useMutation({
    mutationFn: (email: string): Promise<void> => {
      return AuthService.resendEmailVerification(email);
    },
    onSuccess: () => {
      toast.success("Verification email sent", {
        description: "Please check your email.",
        duration: 5000,
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to send verification email", {
        description: error.message,
        duration: 5000,
      });
    },
  });
}