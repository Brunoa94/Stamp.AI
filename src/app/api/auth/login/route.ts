import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { captureError } from "@/lib/observability/errorCapture";
import { LoginRequestSchema } from "@/shared/schemas/auth";
import type { Database } from "@/shared/types/database.types";
import { verifyCaptchaForAction } from "@/lib/security/captcha/verify";
import { CAPTCHA_ACTIONS } from "@/lib/security/captcha/constants";
import { isAuthEmailRequestAllowed } from "@/lib/security/authEmailProtection";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const parsed = LoginRequestSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: "INVALID_REQUEST_BODY" },
        { status: 400 },
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
      return NextResponse.json(
        { error: "SUPABASE_URL_MISSING" },
        { status: 500 },
      );
    }

    if (!supabaseServiceKey) {
      return NextResponse.json(
        { error: "SUPABASE_SERVICE_ROLE_KEY_MISSING" },
        { status: 500 },
      );
    }

    const captchaRequired = process.env.NODE_ENV === "production" ||
      Boolean(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) ||
      Boolean(process.env.RECAPTCHA_SECRET_KEY);

    if (captchaRequired) {
      const captcha = await verifyCaptchaForAction(
        parsed.data.captchaToken ?? "",
        CAPTCHA_ACTIONS.LOGIN,
      );
      if (!captcha.success) {
        return NextResponse.json(
          { error: "CAPTCHA_VERIFICATION_FAILED" },
          { status: 403 },
        );
      }
    }

    const supabaseAdmin = createClient<Database>(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: { autoRefreshToken: false, persistSession: false },
      },
    );

    const { email, password } = parsed.data;

    if (
      !(await isAuthEmailRequestAllowed(supabaseAdmin, request, "login", email))
    ) {
      return NextResponse.json(
        { error: "Too many authentication attempts" },
        { status: 429 },
      );
    }

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.code === "email_not_confirmed") {
        return NextResponse.json(
          { error: "EMAIL_NOT_CONFIRMED" },
          { status: 403 },
        );
      }

      if (
        error.code === "invalid_credentials" ||
        error.message?.toLowerCase().includes("invalid")
      ) {
        return NextResponse.json(
          { error: "INVALID_CREDENTIALS" },
          { status: 401 },
        );
      }

      throw error;
    }

    if (!data.user || !data.session) {
      return NextResponse.json(
        { error: "AUTH_LOGIN_FAILED" },
        { status: 500 },
      );
    }

    // Double-check email confirmation
    if (!data.user.email_confirmed_at) {
      return NextResponse.json(
        { error: "EMAIL_NOT_CONFIRMED" },
        { status: 403 },
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        firstName: data.user.user_metadata?.first_name,
        lastName: data.user.user_metadata?.last_name,
      },
      session: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at,
      },
    });
  } catch (error) {
    captureError(error, {
      service: "AuthLoginAPI",
      action: "login",
    });

    return NextResponse.json({ error: "AUTH_LOGIN_FAILED" }, { status: 500 });
  }
}
