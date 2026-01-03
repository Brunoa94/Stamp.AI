import { createClient } from "@/lib/supabase/client";
import type { LoginI, RegisterI, PasswordResetRequestI, UpdateProfileI } from "@/schemas/auth";
import type { UserI, SessionI, AuthResponseI } from "../../types";

class AuthService {
  private static getSupabase() {
    return createClient();
  }

  /**
   * Login user with email and password
   */
  static async login(credentials: LoginI): Promise<AuthResponseI> {
    const { data, error } = await AuthService.getSupabase().auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error("Login failed");
    }

    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email!,
        email_confirmed_at: data.user.email_confirmed_at,
        last_sign_in_at: data.user.last_sign_in_at,
        created_at: data.user.created_at,
        updated_at: data.user.updated_at,
        user_metadata: data.user.user_metadata,
        app_metadata: data.user.app_metadata,
      },
      session: data.session ? {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at!,
        expires_in: data.session.expires_in,
        token_type: data.session.token_type,
      } : undefined,
    };
  }

  /**
   * Register new user
   */
  static async register(userData: RegisterI): Promise<AuthResponseI> {
    const { data, error } = await AuthService.getSupabase().auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error("Registration failed");
    }

    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email!,
        email_confirmed_at: data.user.email_confirmed_at,
        last_sign_in_at: data.user.last_sign_in_at,
        created_at: data.user.created_at,
        updated_at: data.user.updated_at,
        user_metadata: data.user.user_metadata,
        app_metadata: data.user.app_metadata,
      },
      session: data.session ? {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at!,
        expires_in: data.session.expires_in,
        token_type: data.session.token_type,
      } : undefined,
      message: "Registration successful. Please check your email to verify your account.",
    };
  }

  /**
   * Logout current user
   */
  static async logout(): Promise<void> {
    const { error } = await AuthService.getSupabase().auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Get current session
   */
  static async getSession(): Promise<SessionI | null> {
    const { data, error } = await AuthService.getSupabase().auth.getSession();

    if (error) {
      throw new Error(error.message);
    }

    if (!data.session) {
      return null;
    }

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at!,
      expires_in: data.session.expires_in,
      token_type: data.session.token_type,
    };
  }

  /**
   * Get current user
   */
  static async getUser(): Promise<UserI | null> {
    const { data, error } = await AuthService.getSupabase().auth.getUser();

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      return null;
    }

    return {
      id: data.user.id,
      email: data.user.email!,
      email_confirmed_at: data.user.email_confirmed_at,
      last_sign_in_at: data.user.last_sign_in_at,
      created_at: data.user.created_at,
      updated_at: data.user.updated_at,
      user_metadata: data.user.user_metadata,
      app_metadata: data.user.app_metadata,
    };
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(data: PasswordResetRequestI): Promise<void> {
    const { error } = await AuthService.getSupabase().auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password&type=recovery`,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(data: UpdateProfileI): Promise<UserI> {
    const { data: userData, error } = await AuthService.getSupabase().auth.updateUser({
      data: {
        first_name: data.firstName,
        last_name: data.lastName,
        avatar_url: data.avatarUrl,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!userData.user) {
      throw new Error("Profile update failed");
    }

    return {
      id: userData.user.id,
      email: userData.user.email!,
      email_confirmed_at: userData.user.email_confirmed_at,
      last_sign_in_at: userData.user.last_sign_in_at,
      created_at: userData.user.created_at,
      updated_at: userData.user.updated_at,
      user_metadata: userData.user.user_metadata,
      app_metadata: userData.user.app_metadata,
    };
  }

  /**
   * Resend email verification
   */
  static async resendEmailVerification(email: string): Promise<void> {
    const { error } = await AuthService.getSupabase().auth.resend({
      type: 'signup',
      email: email,
    });

    if (error) {
      throw new Error(error.message);
    }
  }
}

export { AuthService };