import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { captureError } from "@/lib/observability/errorCapture";
import { ResendConfirmationSchema } from "@/schemas/auth";
import { sendBrevoEmail } from "@/lib/email/brevo";
import {
  buildConfirmationEmailHtml,
  CONFIRMATION_EMAIL_SUBJECT,
} from "@/lib/email/confirmationEmailTemplate";

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

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // A magic-link token proves email ownership, so verifying it also
    // confirms the account. It only exists for already-registered users.
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: parsed.data.email,
    });

    // Unknown or already-confirmed emails get the same response as real
    // sends so this endpoint cannot be used to probe registered emails.
    if (error || data.user?.email_confirmed_at) {
      return NextResponse.json(GENERIC_SUCCESS);
    }

    const tokenHash = data.properties?.hashed_token;

    if (!tokenHash) {
      throw new Error("Confirmation link generation returned no token");
    }

    const confirmUrl = new URL("/auth/confirm", request.nextUrl.origin);
    confirmUrl.searchParams.set("token_hash", tokenHash);
    confirmUrl.searchParams.set("type", "magiclink");
    confirmUrl.searchParams.set("next", "/stamp");

    const sent = await sendBrevoEmail({
      to: parsed.data.email,
      subject: CONFIRMATION_EMAIL_SUBJECT,
      htmlContent: buildConfirmationEmailHtml({
        firstName: data.user?.user_metadata?.first_name,
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
