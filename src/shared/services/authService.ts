import { clearPrivateBrowserState } from "./privateBrowserState";
import { createClient } from "@/lib/supabase/client";
import type {
  LoginI,
  LoginRequestI,
  PasswordResetRequestI,
  RegisterI,
  SignupRequestI,
  UpdateProfileI,
} from "@/shared/schemas/auth";
import type { AuthResponseI, SessionI, UserI } from "../../../supabase/types";
import { AuthServiceMapper } from "@/shared/mappers/services/authServiceMapper";
import {
  GetSessionResponseSchema,
  GetUserResponseSchema,
  UpdateUserResponseSchema,
} from "@/shared/schemas/services/authServiceSchemas";
import { ErrorClient } from "./errorClient";
import type { PendingGuestClaimT } from "./guestClaimStorageService";

class AuthService {
  private static getSupabase() {
    return createClient();
  }

  /**
   * Login user with email and password
   * Server route verifies CAPTCHA and rate limits before authenticating
   */
  static async login(
    credentials: LoginI,
    captchaToken?: string | null,
  ): Promise<AuthResponseI> {
    try {
      const body: LoginRequestI = {
        email: credentials.email,
        password: credentials.password,
        captchaToken,
      };

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        throw ErrorClient.handleError({
          error: result,
          service: "Auth",
          action: "Login",
        });
      }

      // Set the session on the client after successful API login
      const { error: setSessionError } = await AuthService.getSupabase().auth
        .setSession({
          access_token: result.session.accessToken,
          refresh_token: result.session.refreshToken,
        });

      if (setSessionError) {
        throw ErrorClient.handleError({
          error: setSessionError,
          service: "Auth",
          action: "Login",
        });
      }

      return {
        success: true,
        user: result.user,
        session: result.session,
      };
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
  static async register(
    userData: RegisterI,
    captchaToken?: string | null,
  ): Promise<AuthResponseI> {
    try {
      const body: SignupRequestI = {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        captchaToken,
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
      if (!error) clearPrivateBrowserState();
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
        // AuthSessionMissingError is expected when user is not logged in
        // Return null instead of throwing an error
        if (error.name === "AuthSessionMissingError") {
          return null;
        }
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
      // Also handle AuthSessionMissingError if thrown directly
      if (error instanceof Error && error.name === "AuthSessionMissingError") {
        return null;
      }
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
        // AuthSessionMissingError is expected when user is not logged in
        // Return null instead of throwing an error
        if (error.name === "AuthSessionMissingError") {
          return null;
        }
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
      // Also handle AuthSessionMissingError if thrown directly
      if (error instanceof Error && error.name === "AuthSessionMissingError") {
        return null;
      }
      throw ErrorClient.handleError({
        error,
        service: "Auth",
        action: "Get User",
      });
    }
  }

  /**
   * Start an anonymous (guest) session, so a visitor without an account gets
   * a real auth.uid() for creating products and paying.
   */
  static async signInAsGuest(): Promise<UserI> {
    try {
      const { data, error } = await AuthService.getSupabase().auth
        .signInAnonymously();

      if (error || !data.user) {
        throw ErrorClient.handleError({
          error: error ?? new Error("Anonymous sign-in returned no user"),
          service: "Auth",
          action: "Sign In As Guest",
        });
      }

      return AuthServiceMapper.mapSupabaseUserToUser(data.user);
    } catch (error) {
      throw ErrorClient.handleError({
        error,
        service: "Auth",
        action: "Sign In As Guest",
      });
    }
  }

  /**
   * The current session when it is a guest's anonymous one, else null.
   */
  static async getAnonymousSession(): Promise<PendingGuestClaimT | null> {
    const { data } = await AuthService.getSupabase().auth.getSession();
    const session = data.session;
    if (!session?.user.is_anonymous) return null;
    return { accessToken: session.access_token, userId: session.user.id };
  }

  /**
   * Move a guest's products and uploaded images to the logged-in account.
   * The edge function verifies both the caller and the guest token.
   */
  static async claimGuestProducts(anonymousAccessToken: string): Promise<void> {
    try {
      const { data } = await AuthService.getSupabase().auth.getSession();
      if (!data.session) throw new Error("Not authenticated");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/claim-guest-products`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${data.session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ anonymousAccessToken }),
        },
      );

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw ErrorClient.handleError({
          error: { error: result.error || "Failed to claim guest products" },
          service: "Auth",
          action: "Claim Guest Products",
        });
      }
    } catch (error) {
      throw ErrorClient.handleError({
        error,
        service: "Auth",
        action: "Claim Guest Products",
      });
    }
  }

  /**
   * Turn the guest's anonymous user into their Google account, so the uid
   * (and the products and cart it owns) stays the same. Redirects to Google.
   * If that Google account already belongs to a user, the callback falls
   * back to a normal Google sign-in.
   */
  static async linkGoogleIdentity(): Promise<void> {
    try {
      const { error } = await AuthService.getSupabase().auth.linkIdentity({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/stamp`,
        },
      });

      if (error) {
        throw ErrorClient.handleError({
          error,
          service: "Auth",
          action: "Link Google Identity",
        });
      }
    } catch (error) {
      throw ErrorClient.handleError({
        error,
        service: "Auth",
        action: "Link Google Identity",
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
      const updateData: Record<string, unknown> = {};

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
  static async resendEmailVerification(
    email: string,
    captchaToken?: string | null,
  ): Promise<void> {
    try {
      const response = await fetch("/api/auth/resend-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, captchaToken }),
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
