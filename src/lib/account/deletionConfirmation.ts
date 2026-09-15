import { ACCOUNT_DELETION_CONFIRMATION_PHRASE } from "@/schemas/account";

export type DeletionConfirmationInputType = {
  confirmation: string;
  password?: string;
};

export type DeletionConfirmationErrorType =
  | "CONFIRMATION_PHRASE_MISMATCH"
  | "PASSWORD_REQUIRED";

export type DeletionConfirmationResultType =
  | { ok: true; verifyPassword: boolean }
  | { ok: false; error: DeletionConfirmationErrorType };

type AuthUserLikeType = {
  app_metadata?: { provider?: unknown; providers?: unknown } | null;
};

/** Whether the auth user can sign in with an email + password. */
export function userHasPasswordIdentity(user: AuthUserLikeType): boolean {
  const meta = user.app_metadata;
  if (!meta) return false;
  if (Array.isArray(meta.providers) && meta.providers.includes("email")) {
    return true;
  }
  return meta.provider === "email";
}

/**
 * Pure decision: the confirmation phrase is always mandatory; a re-entered
 * password is mandatory too when the account has a password identity (social
 * sign-in accounts have none to re-enter). Password *verification* happens in
 * the route with Supabase; this only decides whether it must happen.
 */
export function evaluateDeletionConfirmation(
  input: DeletionConfirmationInputType,
  hasPasswordIdentity: boolean,
): DeletionConfirmationResultType {
  if (input.confirmation.trim() !== ACCOUNT_DELETION_CONFIRMATION_PHRASE) {
    return { ok: false, error: "CONFIRMATION_PHRASE_MISMATCH" };
  }
  if (hasPasswordIdentity && !input.password) {
    return { ok: false, error: "PASSWORD_REQUIRED" };
  }
  return { ok: true, verifyPassword: hasPasswordIdentity };
}
