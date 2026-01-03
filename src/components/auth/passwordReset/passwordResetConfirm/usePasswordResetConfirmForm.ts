import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PasswordResetConfirmSchema, type PasswordResetConfirmI } from "@/schemas/auth";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useErrorHandler } from "@/hooks/useErrorHandler";

export function usePasswordResetConfirmForm() {
  const searchParams = useSearchParams();
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const supabase = createClient();
  const { handleError, handleSuccess } = useErrorHandler();

  const {
    register,
    handleSubmit,
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

  const onSubmit = async (data: PasswordResetConfirmI) => {
    setIsPending(true);

    try {
      // Get current session to verify user is authenticated from reset link
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !sessionData?.session) {
        throw new Error('Invalid reset link or session expired. Please request a new password reset.');
      }

      // Update the password
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        throw error;
      }

      setIsSuccess(true);
      handleSuccess("Password reset successful. You can now log in with your new password.");

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
  };
}