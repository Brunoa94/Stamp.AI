import type { User as SupabaseUser, Session as SupabaseSession } from "@supabase/supabase-js";
import type { UserI, SessionI, AuthResponseI } from "@/types/auth";

export class AuthServiceMapper {
  /**
   * Map Supabase User to UserI
   */
  static mapSupabaseUserToUser(supabaseUser: SupabaseUser): UserI {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email!,
      email_confirmed_at: supabaseUser.email_confirmed_at,
      last_sign_in_at: supabaseUser.last_sign_in_at,
      created_at: supabaseUser.created_at,
      updated_at: supabaseUser.updated_at,
      user_metadata: supabaseUser.user_metadata,
      app_metadata: supabaseUser.app_metadata,
    };
  }

  /**
   * Map Supabase Session to SessionI
   */
  static mapSupabaseSessionToSession(supabaseSession: SupabaseSession | null): SessionI | undefined {
    if (!supabaseSession) return undefined;

    return {
      access_token: supabaseSession.access_token,
      refresh_token: supabaseSession.refresh_token,
      expires_at: supabaseSession.expires_at!,
      expires_in: supabaseSession.expires_in,
      token_type: supabaseSession.token_type,
    };
  }

  /**
   * Map Supabase auth response to AuthResponseI
   */
  static mapSupabaseAuthToAuthResponse(
    user: SupabaseUser | null,
    session: SupabaseSession | null,
    message?: string
  ): AuthResponseI {
    if (!user) {
      return {
        success: false,
        error: message || "Authentication failed",
      };
    }

    return {
      success: true,
      user: this.mapSupabaseUserToUser(user),
      session: this.mapSupabaseSessionToSession(session),
      message,
    };
  }

  /**
   * Extract user metadata fields
   */
  static extractUserMetadata(user: UserI) {
    return {
      firstName: user.user_metadata?.first_name,
      lastName: user.user_metadata?.last_name,
      fullName: user.user_metadata?.full_name,
      avatarUrl: user.user_metadata?.avatar_url,
    };
  }

  /**
   * Check if session is expired
   */
  static isSessionExpired(session: SessionI): boolean {
    if (!session.expires_at) return true;
    return Date.now() / 1000 > session.expires_at;
  }

  /**
   * Get time until session expires (in seconds)
   */
  static getTimeUntilExpiry(session: SessionI): number {
    if (!session.expires_at) return 0;
    return Math.max(0, session.expires_at - Date.now() / 1000);
  }
}
