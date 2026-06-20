"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type RegisterI, RegisterSchema } from "@/schemas/auth";
import { useRegister } from "@/hooks/useAuth";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useState } from "react";

export function useRegisterForm() {
  const registerMutation = useRegister();
  const [isSuccess, setIsSuccess] = useState(false);
  const { handleError, handleSuccess } = useErrorHandler();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterI>({
    resolver: zodResolver(RegisterSchema),
  });

  const onSubmit = async (data: RegisterI) => {
    try {
      await registerMutation.mutateAsync(data);

      setIsSuccess(true);

      handleSuccess(
        "Account created successfully! Please check your email to verify your account.",
      );
    } catch (error) {
      handleError(error);
    }
  };

  return {
    register,
    handleSubmit,
    onSubmit,
    isPending: registerMutation.isPending,
    errors,
    isSuccess,
  };
}
