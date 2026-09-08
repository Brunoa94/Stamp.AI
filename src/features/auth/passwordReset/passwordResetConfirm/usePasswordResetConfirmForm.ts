import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PasswordResetConfirmSchema, type PasswordResetConfirmI } from "@/schemas/auth";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useErrorHandler } from "@/hooks/useErrorHandler";

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

  // Check if we have valid reset tokens on mount
  useEffect(() => {
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // If there's an error in the URL, show error state
    if (error) {
      console.error('Password reset error:', error, errorDescription);
      setIsError(true);
    }
  }, [searchParams]);

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
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !sessionData?.session) {
        throw new Error(t("invalidSessionError"));
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
    isError,
    errors,
  };
}