import { createClient } from "@/lib/supabase/client";
import type {
  LoginI,
  PasswordResetRequestI,
  RegisterI,
  SignupRequestI,
  UpdateProfileI,
} from "@/schemas/auth";
import type { AuthResponseI, SessionI, UserI } from "../../supabase/types";
import { AuthServiceMapper } from "@/mappers/services/authServiceMapper";
import {
  GetSessionResponseSchema,
  GetUserResponseSchema,
  SupabaseAuthResponseSchema,
  UpdateUserResponseSchema,
} from "@/schemas/services/authServiceSchemas";
import { AppError, ErrorClient } from "./errorClient";

class AuthService {
  private static getSupabase() {
    return createClient();
  }

  /**
   * Login user with email and password
   * Uses AuthServiceMapper to transform Supabase response
   */
  static async login(
    credentials: LoginI,
    captchaToken?: string,
  ): Promise<AuthResponseI> {
    try {
      const { data, error } = await AuthService.getSupabase().auth
        .signInWithPassword({
          email: credentials.email,
          password: credentials.password,
          options: captchaToken ? { captchaToken } : undefined,
        });

      if (error) {
        // Supabase's own confirmation gate uses a lowercase code that the
        // error handler can't translate — map it to our error code
        const mappedError = error.code === "email_not_confirmed"
          ? new AppError("EMAIL_NOT_CONFIRMED", "EMAIL_NOT_CONFIRMED")
          : error;

        throw ErrorClient.handleError({
          error: mappedError,
          service: "Auth",
          action: "Login",
        });
      }

      // Validate Supabase response
      SupabaseAuthResponseSchema.parse(data);

      // Supabase only rejects unconfirmed sign-ins when "Confirm email" is
      // enabled server-side, so enforce activation here as well
      if (!data.user?.email_confirmed_at) {
        await AuthService.getSupabase().auth.signOut();
        throw new AppError("EMAIL_NOT_CONFIRMED", "EMAIL_NOT_CONFIRMED");
      }

      return AuthServiceMapper.mapSupabaseAuthToAuthResponse(
        data.user,
        data.session,
      );
    } catch (error) {
      throw ErrorClient.handleError({
        error,
        service: "Auth",
        action: "Login",
      });
    }
  }

  /**
   * Register new user
   * Server route creates the account and emails a confirmation link; the
   * account stays inactive (no session) until the link is clicked
   */
  static async register(userData: RegisterI): Promise<AuthResponseI> {
    try {
      const body: SignupRequestI = {
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
      };

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        throw ErrorClient.handleError({
          error: result,
          service: "Auth",
          action: "Register",
        });
      }

      return {
        success: true,
        message: result.message ??
          "Registration successful. Please check your email to confirm your account.",
      };
    } catch (error) {
      throw ErrorClient.handleError({
        error,
        service: "Auth",
        action: "Register",
      });
    }
  }

  /**
   * Logout current user
   */
  static async logout(): Promise<void> {
    try {
      const { error } = await AuthService.getSupabase().auth.signOut();
      if (error) {
        throw ErrorClient.handleError({
          error,
          service: "Auth",
          action: "Logout",
        });
      }
    } catch (error) {
      throw ErrorClient.handleError({
        error,
        service: "Auth",
        action: "Logout",
      });
    }
  }

  /**
   * Get current session
   * Uses AuthServiceMapper to transform Supabase session
   */
  static async getSession(): Promise<SessionI | null> {
    try {
      const { data, error } = await AuthService.getSupabase().auth.getSession();

      if (error) {
        throw ErrorClient.handleError({
          error,
          service: "Auth",
          action: "Get Session",
        });
      }

      // Validate Supabase response
      GetSessionResponseSchema.parse(data);

      return AuthServiceMapper.mapSupabaseSessionToSession(data.session) ||
        null;
    } catch (error) {
      throw ErrorClient.handleError({
        error,
        service: "Auth",
        action: "Get Session",
      });
    }
  }

  /**
   * Get current user
   * Uses AuthServiceMapper to transform Supabase user
   */
  static async getUser(): Promise<UserI | null> {
    try {
      const { data, error } = await AuthService.getSupabase().auth.getUser();

      if (error) {
        throw ErrorClient.handleError({
          error,
          service: "Auth",
          action: "Get User",
        });
      }

      // Validate Supabase response
      GetUserResponseSchema.parse(data);

      if (!data.user) {
        return null;
      }

      return AuthServiceMapper.mapSupabaseUserToUser(data.user);
    } catch (error) {
      throw ErrorClient.handleError({
        error,
        service: "Auth",
        action: "Get User",
      });
    }
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(
    data: PasswordResetRequestI,
  ): Promise<void> {
    try {
      const { error } = await AuthService.getSupabase().auth
        .resetPasswordForEmail(data.email, {
          redirectTo:
            `${window.location.origin}/auth/callback?next=/reset-password&type=recovery`,
        });

      if (error) {
        throw ErrorClient.handleError({
          error,
          service: "Auth",
          action: "Request Password Reset",
        });
      }
    } catch (error) {
      throw ErrorClient.handleError({
        error,
        service: "Auth",
        action: "Request Password Reset",
      });
    }
  }

  /**
   * Update user profile
   * Uses AuthServiceMapper to transform Supabase user
   */
  static async updateProfile(data: UpdateProfileI): Promise<UserI> {
    try {
      const updateData: Record<string, any> = {};

      if (data.firstName !== undefined) {
        updateData.first_name = data.firstName;
      }
      if (data.lastName !== undefined) {
        updateData.last_name = data.lastName;
      }
      if (data.avatarUrl !== undefined) {
        updateData.avatar_url = data.avatarUrl;
      }
      if (data.metadata !== undefined) {
        Object.assign(updateData, data.metadata);
      }

      const { data: userData, error } = await AuthService.getSupabase().auth
        .updateUser({
          data: updateData,
        });

      if (error) {
        throw ErrorClient.handleError({
          error,
          service: "Auth",
          action: "Update Profile",
        });
      }

      // Validate Supabase response
      UpdateUserResponseSchema.parse(userData);

      if (!userData.user) {
        throw ErrorClient.handleError({
          error: new Error("Profile update failed"),
          service: "Auth",
          action: "Update Profile",
        });
      }

      return AuthServiceMapper.mapSupabaseUserToUser(userData.user);
    } catch (error) {
      throw ErrorClient.handleError({
        error,
        service: "Auth",
        action: "Update Profile",
      });
    }
  }

  /**
   * Resend email verification
   * Server route re-issues the confirmation link and emails it via Brevo
   */
  static async resendEmailVerification(email: string): Promise<void> {
    try {
      const response = await fetch("/api/auth/resend-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw ErrorClient.handleError({
          error: result,
          service: "Auth",
          action: "Resend Email Verification",
        });
      }
    } catch (error) {
      throw ErrorClient.handleError({
        error,
        service: "Auth",
        action: "Resend Email Verification",
      });
    }
  }

  /**
   * Sign in with Google OAuth
   * Redirects to Google for authentication
   */
  static async signInWithGoogle(): Promise<void> {
    try {
      const { error } = await AuthService.getSupabase().auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/stamp`,
        },
      });

      if (error) {
        throw ErrorClient.handleError({
          error,
          service: "Auth",
          action: "Sign In With Google",
        });
      }
    } catch (error) {
      throw ErrorClient.handleError({
        error,
        service: "Auth",
        action: "Sign In With Google",
      });
    }
  }

  /**
   * Update user password
   * Uses AuthServiceMapper to transform Supabase user
   */
  static async updatePassword(password: string): Promise<UserI> {
    try {
      const { data, error } = await AuthService.getSupabase().auth.updateUser({
        password,
      });

      if (error) {
        throw ErrorClient.handleError({
          error,
          service: "Auth",
          action: "Update Password",
        });
      }

      // Validate Supabase response
      UpdateUserResponseSchema.parse(data);

      if (!data.user) {
        throw ErrorClient.handleError({
          error: new Error("User data not returned"),
          service: "Auth",
          action: "Update Password",
        });
      }

      return AuthServiceMapper.mapSupabaseUserToUser(data.user);
    } catch (error) {
      throw ErrorClient.handleError({
        error,
        service: "Auth",
        action: "Update Password",
      });
    }
  }
}

export { AuthService };
