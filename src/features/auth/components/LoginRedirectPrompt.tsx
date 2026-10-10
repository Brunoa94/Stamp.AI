"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Dialog } from "@/features/ui/dialog";
import { useUser } from "@/shared/queries/authQueries";
import { LoginForm } from "../login/LoginForm";
import {
  getSafeRedirectPath,
  REDIRECTED_FROM_PARAM,
} from "../lib/helpers/redirectTarget";

/**
 * Opens the login dialog when the middleware has bounced a guest off a
 * protected page (`/?redirectedFrom=/stamp`). Without it the redirect lands
 * silently on the page the guest was already on, so the click appears to do
 * nothing. Closing the dialog drops the parameter so the next click reopens it.
 */
export function LoginRedirectPrompt() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { data: user, isLoading } = useUser();
  const target = getSafeRedirectPath(searchParams.get(REDIRECTED_FROM_PARAM));
  const isOpen = Boolean(target) && !isLoading && !user;

  const handleOpenChange = (open: boolean) => {
    if (open) return;
    const params = new URLSearchParams(searchParams.toString());
    params.delete(REDIRECTED_FROM_PARAM);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {isOpen && <LoginForm />}
    </Dialog>
  );
}
