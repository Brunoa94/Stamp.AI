import { createClient } from "@/lib/supabase/client";
import type { LoginI, RegisterI, PasswordResetRequestI, UpdateProfileI } from "@/schemas/auth";
import type { UserI, SessionI, AuthResponseI } from "@/types/auth";
import { AuthServiceMapper } from "@/mappers/services";
import {
  SupabaseAuthResponseSchema,
  GetUserResponseSchema,
  GetSessionResponseSchema,
  UpdateUserResponseSchema,
} from "@/schemas/services";
import { z } from "zod";
import type { User, Session } from "@supabase/supabase-js";

class AuthService {
  private static getSupabase() {
    return createClient();
  }

  /**
   * Login user with email and password
   * Uses AuthServiceMapper to transform Supabase response
   */
  static async login(credentials: LoginI): Promise<AuthResponseI> {
    try {
      const { data, error } = await AuthService.getSupabase().auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        throw new Error(error.message);
      }

      // Validate Supabase response
      SupabaseAuthResponseSchema.parse(data);

      return AuthServiceMapper.mapSupabaseAuthToAuthResponse(
        data.user,
        data.session
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Login response validation failed: ${error.message}`);
      }
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Login failed: Unknown error occurred');
    }
  }

  /**
   * Register new user
   * Uses AuthServiceMapper to transform Supabase response
   */
  static async register(userData: RegisterI): Promise<AuthResponseI> {
    try {
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

      // Validate Supabase response
      SupabaseAuthResponseSchema.parse(data);

      return AuthServiceMapper.mapSupabaseAuthToAuthResponse(
        data.user,
        data.session,
        "Registration successful. Please check your email to verify your account."
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Registration response validation failed: ${error.message}`);
      }
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Registration failed: Unknown error occurred');
    }
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
   * Uses AuthServiceMapper to transform Supabase session
   */
  static async getSession(): Promise<SessionI | null> {
    try {
      const { data, error } = await AuthService.getSupabase().auth.getSession();

      if (error) {
        throw new Error(error.message);
      }

      // Validate Supabase response
      GetSessionResponseSchema.parse(data);

      return AuthServiceMapper.mapSupabaseSessionToSession(data.session) || null;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Session response validation failed: ${error.message}`);
      }
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Get session failed: Unknown error occurred');
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
        throw new Error(error.message);
      }

      // Validate Supabase response
      GetUserResponseSchema.parse(data);

      if (!data.user) {
        return null;
      }

      return AuthServiceMapper.mapSupabaseUserToUser(data.user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`User response validation failed: ${error.message}`);
      }
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Get user failed: Unknown error occurred');
    }
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

      const { data: userData, error } = await AuthService.getSupabase().auth.updateUser({
        data: updateData,
      });

      if (error) {
        throw new Error(error.message);
      }

      // Validate Supabase response
      UpdateUserResponseSchema.parse(userData);

      if (!userData.user) {
        throw new Error("Profile update failed");
      }

      return AuthServiceMapper.mapSupabaseUserToUser(userData.user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Update profile validation failed: ${error.message}`);
      }
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Update profile failed: Unknown error occurred');
    }
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
        throw new Error(`Password update failed: ${error.message}`);
      }

      // Validate Supabase response
      UpdateUserResponseSchema.parse(data);

      if (!data.user) {
        throw new Error("Password update failed: User data not returned");
      }

      return AuthServiceMapper.mapSupabaseUserToUser(data.user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Password update validation failed: ${error.message}`);
      }
      if (error instanceof Error) {
        throw new Error(`Password update failed: ${error.message}`);
      }
      throw new Error("Password update failed: Unknown error occurred");
    }
  }
}

export { AuthService };