import { useTransition } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useErrorHandler } from "@/shared/hooks/useErrorHandler";
import { LocaleService } from "@/shared/services/localeService";

/**
 * Switch the site language: saves the choice, then re-renders the current
 * page on the server so every message comes back in the new language.
 * `isSwitching` stays true until that re-render lands, and `pendingLocale`
 * is the language being switched to, so the UI can show it straight away.
 */
export function useSetLocale() {
  const router = useRouter();
  const { handleError } = useErrorHandler();
  const [isRefreshing, startRefresh] = useTransition();

  const mutation = useMutation({
    mutationFn: LocaleService.save,
    onSuccess: () => startRefresh(() => router.refresh()),
    onError: (error: Error) => handleError(error),
  });

  const isSwitching = mutation.isPending || isRefreshing;

  return {
    switchLocale: mutation.mutate,
    isSwitching,
    pendingLocale: isSwitching ? mutation.variables : undefined,
  };
}
