import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type PasswordResetConfirmI,
  PasswordResetConfirmSchema,
} from "@/shared/schemas/auth";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useErrorHandler } from "@/shared/hooks/useErrorHandler";
import { UserFacingError } from "@/shared/errors/UserFacingError";

export function usePasswordResetConfirmForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const supabase = createClient();
  const { handleError, handleSuccess } = useErrorHandler();
  const t = useTranslations("auth.passwordReset.confirm");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordResetConfirmI>({
    resolver: zodResolver(PasswordResetConfirmSchema),
  });

  // A reset link that came back with an error (expired, already used) shows
  // the error state straight away.
  const hasLinkError = Boolean(searchParams.get("error"));

  // Handle redirect after successful password reset
  useEffect(() => {
    if (isSuccess) {
      const timeoutId = setTimeout(() => {
        router.push("/");
      }, 3000);

      return () => clearTimeout(timeoutId);
    }
  }, [isSuccess, router]);

  const onSubmit = async (data: PasswordResetConfirmI) => {
    setIsPending(true);

    try {
      // Get current session to verify user is authenticated from reset link
      const { data: sessionData, error: sessionError } = await supabase.auth
        .getSession();

      if (sessionError || !sessionData?.session) {
        throw new UserFacingError(t("invalidSessionError"));
      }

      // Update the password
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        throw error;
      }

      setIsSuccess(true);
      handleSuccess(t("successToast"));
    } catch (error) {
      handleError(error);
      setIsError(true);
    } finally {
      setIsPending(false);
    }
  };

  return {
    register,
    handleSubmit,
    onSubmit,
    isPending,
    isSuccess,
    isError: isError || hasLinkError,
    errors,
  };
}
