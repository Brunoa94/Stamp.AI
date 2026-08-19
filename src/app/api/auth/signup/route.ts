import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { captureError } from "@/lib/observability/errorCapture";
import { SignupRequestSchema } from "@/schemas/auth";
import { sendBrevoEmail } from "@/lib/email/brevo";
import {
  buildConfirmationEmailHtml,
  CONFIRMATION_EMAIL_SUBJECT,
} from "@/lib/email/confirmationEmailTemplate";

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

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { email, password, firstName, lastName } = parsed.data;

    // Creates the user unconfirmed and returns a one-time confirmation
    // token; for an existing unconfirmed user it re-issues the token.
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "signup",
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (error) {
      if (error.message?.toLowerCase().includes("already")) {
        return NextResponse.json(
          { error: "EMAIL_ALREADY_REGISTERED" },
          { status: 409 },
        );
      }
      throw error;
    }

    const tokenHash = data.properties?.hashed_token;

    if (!tokenHash) {
      throw new Error("Signup link generation returned no token");
    }

    const confirmUrl = new URL("/auth/confirm", request.nextUrl.origin);
    confirmUrl.searchParams.set("token_hash", tokenHash);
    confirmUrl.searchParams.set("type", "signup");
    confirmUrl.searchParams.set("next", "/stamp");

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
