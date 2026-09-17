import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";
import { captureError } from "@/lib/observability/errorCapture";
import {
  ResendConfirmationSchema,
  UnconfirmedAuthUserSchema,
} from "@/shared/schemas/auth";
import { sendBrevoEmail } from "@/lib/email/brevo";
import {
  buildConfirmationEmailHtml,
  CONFIRMATION_EMAIL_SUBJECT,
} from "@/lib/email/confirmationEmailTemplate";
import { SITE_URL } from "@/features/seo/config/site";
import type { Database } from "@/shared/types/database.types";
import { verifyCaptchaForAction } from "@/lib/security/captcha/verify";
import { CAPTCHA_ACTIONS } from "@/lib/security/captcha/constants";
import { isAuthEmailRequestAllowed } from "@/lib/security/authEmailProtection";

export const runtime = "nodejs";

const GENERIC_SUCCESS = {
  success: true,
  message:
    "If an account exists for this email, a confirmation link has been sent.",
};

export async function POST(request: NextRequest) {
  try {
    const parsed = ResendConfirmationSchema.safeParse(await request.json());

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

    const supabaseAdmin = createClient<Database>(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: { autoRefreshToken: false, persistSession: false },
      },
    );

    if (
      !(await isAuthEmailRequestAllowed(
        supabaseAdmin,
        request,
        "resend-confirmation",
        parsed.data.email,
      ))
    ) {
      return NextResponse.json(
        { error: "Too many authentication attempts" },
        { status: 429 },
      );
    }

    // This restricted RPC avoids listing the entire auth user directory and
    // returns no information for unknown or already-confirmed addresses.
    const { data: existingData, error: lookupError } = await supabaseAdmin.rpc(
      "find_unconfirmed_auth_user",
      { p_email: parsed.data.email },
    );
    if (lookupError) throw lookupError;

    const existingResult = UnconfirmedAuthUserSchema.safeParse(existingData);
    const existingUser = existingResult.success ? existingResult.data : null;

    if (!existingUser) {
      return NextResponse.json(GENERIC_SUCCESS);
    }

    // Neutralize any password chosen during a malicious pre-registration.
    const { error: updateError } = await supabaseAdmin.auth.admin
      .updateUserById(
        existingUser.id,
        { password: randomBytes(48).toString("base64url") },
      );
    if (updateError) throw updateError;

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: parsed.data.email,
    });

    if (error) throw error;

    const tokenHash = data.properties?.hashed_token;

    if (!tokenHash) {
      throw new Error("Confirmation link generation returned no token");
    }

    const confirmUrl = new URL("/auth/confirm", SITE_URL);
    confirmUrl.searchParams.set("token_hash", tokenHash);
    confirmUrl.searchParams.set(
      "type",
      data.properties.verification_type,
    );
    confirmUrl.searchParams.set("next", "/reset-password?onboarding=true");

    const sent = await sendBrevoEmail({
      to: parsed.data.email,
      subject: CONFIRMATION_EMAIL_SUBJECT,
      htmlContent: buildConfirmationEmailHtml({
        firstName: existingUser.first_name ?? undefined,
        confirmUrl: confirmUrl.toString(),
      }),
    });

    if (!sent) {
      return NextResponse.json(
        { error: "CONFIRMATION_EMAIL_SEND_FAILED" },
        { status: 502 },
      );
    }

    return NextResponse.json(GENERIC_SUCCESS);
  } catch (error) {
    captureError(error, {
      service: "AuthResendConfirmationAPI",
      action: "resendConfirmation",
    });

    return NextResponse.json(
      { error: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
