import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";
import { captureError } from "@/lib/observability/errorCapture";
import {
  SignupRequestSchema,
  UnconfirmedAuthUserSchema,
} from "@/schemas/auth";
import { sendBrevoEmail } from "@/lib/email/brevo";
import {
  buildConfirmationEmailHtml,
  CONFIRMATION_EMAIL_SUBJECT,
} from "@/lib/email/confirmationEmailTemplate";
import { SITE_URL } from "@/features/seo/config/site";
import type { Database } from "@/types/database.types";
import { verifyCaptchaForAction } from "@/lib/security/captcha/verify";
import { CAPTCHA_ACTIONS } from "@/lib/security/captcha/constants";
import { isAuthEmailRequestAllowed } from "@/lib/security/authEmailProtection";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const parsed = SignupRequestSchema.safeParse(await request.json());

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
        CAPTCHA_ACTIONS.REGISTER,
      );
      if (!captcha.success) {
        return NextResponse.json(
          { error: "CAPTCHA_VERIFICATION_FAILED" },
          { status: 403 },
        );
      }
    }

    const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { email, firstName, lastName } = parsed.data;

    if (!(await isAuthEmailRequestAllowed(
      supabaseAdmin,
      request,
      "signup",
      email,
    ))) {
      return NextResponse.json(
        { error: "Too many authentication attempts" },
        { status: 429 },
      );
    }

    const { data: existingData, error: lookupError } = await supabaseAdmin.rpc(
      "find_unconfirmed_auth_user",
      { p_email: email },
    );
    if (lookupError) throw lookupError;

    const existingResult = UnconfirmedAuthUserSchema.safeParse(existingData);
    const existingUser = existingResult.success ? existingResult.data : null;
    const temporaryPassword = randomBytes(48).toString("base64url");

    // If someone pre-registered this address, invalidate the attacker-known
    // password before issuing a fresh ownership challenge.
    if (existingUser) {
      const { error: updateError } = await supabaseAdmin.auth.admin
        .updateUserById(existingUser.id, {
          password: temporaryPassword,
          user_metadata: {
            first_name: firstName,
            last_name: lastName,
          },
        });
      if (updateError) throw updateError;
    }

    // Creates the user unconfirmed and returns a one-time confirmation
    // token; for an existing unconfirmed user it re-issues the token.
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "signup",
      email,
      password: temporaryPassword,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (error) {
      if (
        error.code === "email_exists" ||
        error.code === "user_already_exists" ||
        error.message?.toLowerCase().includes("already")
      ) {
        return NextResponse.json({
          success: true,
          message:
            "Registration successful. Please check your email to confirm your account.",
        });
      }
      throw error;
    }

    const tokenHash = data.properties?.hashed_token;

    if (!tokenHash) {
      throw new Error("Signup link generation returned no token");
    }

    const confirmUrl = new URL("/auth/confirm", SITE_URL);
    confirmUrl.searchParams.set("token_hash", tokenHash);
    confirmUrl.searchParams.set("type", "signup");
    confirmUrl.searchParams.set("next", "/reset-password?onboarding=true");

    const sent = await sendBrevoEmail({
      to: email,
      subject: CONFIRMATION_EMAIL_SUBJECT,
      htmlContent: buildConfirmationEmailHtml({
        firstName,
        confirmUrl: confirmUrl.toString(),
      }),
    });

    if (!sent) {
      // The account exists but cannot be activated without the email;
      // re-submitting the form re-issues the token and retries the send.
      return NextResponse.json(
        { error: "CONFIRMATION_EMAIL_SEND_FAILED" },
        { status: 502 },
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Registration successful. Please check your email to confirm your account.",
    });
  } catch (error) {
    captureError(error, {
      service: "AuthSignupAPI",
      action: "signup",
    });

    return NextResponse.json(
      { error: "AUTH_REGISTRATION_FAILED" },
      { status: 500 },
    );
  }
}
