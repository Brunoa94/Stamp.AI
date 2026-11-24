import type { ReactNode } from "react";

/**
 * AuthPageCard
 *
 * Shell for the standalone auth pages (check email, reset password, auth
 * code error, Google sign-in fallback): the content starts under the fixed
 * h-24 header inside the page gutter, centred in a white rounded-xl card
 * with a divider border and the soft stamp shadow, opened by the amber
 * accent bar. Pages put their own h1 and copy inside.
 */

interface PropsI {
  children: ReactNode;
}

export function AuthPageCard({ children }: PropsI) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 pt-28 pb-20 sm:px-6 lg:px-12">
      <div className="w-full max-w-md rounded-xl border border-(--color-stamp-divider) bg-(--color-stamp-white) p-6 text-center shadow-(--shadow-stamp-card) sm:p-10">
        <div aria-hidden className="mx-auto mb-6 h-1.5 w-16 rounded-full bg-(--color-stamp-gold)" />
        {children}
      </div>
    </div>
  );
}
