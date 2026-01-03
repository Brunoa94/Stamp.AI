import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PasswordResetRequestSchema, type PasswordResetRequestI } from "@/schemas/auth";
import { usePasswordResetRequest } from "@/hooks/useAuth";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useState } from "react";

export function usePasswordResetRequestForm() {
  const resetMutation = usePasswordResetRequest();
  const [isSuccess, setIsSuccess] = useState(false);
  const { handleError, handleSuccess } = useErrorHandler();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordResetRequestI>({
    resolver: zodResolver(PasswordResetRequestSchema),
  });

  const onSubmit = async (data: PasswordResetRequestI) => {
    try {
      await resetMutation.mutateAsync(data);
      setIsSuccess(true);
      handleSuccess("Password reset email sent successfully. Check your inbox for instructions.");
    } catch (error) {
      handleError(error);
    }
  };

  return {
    register,
    handleSubmit,
    onSubmit,
    isPending: resetMutation.isPending,
    errors,
    isSuccess,
  };
}