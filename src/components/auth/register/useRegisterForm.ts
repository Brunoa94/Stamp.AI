import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema, type RegisterI } from "@/schemas/auth";
import { useRegister } from "@/hooks/useAuth";
import { useState } from "react";

export function useRegisterForm() {
  const registerMutation = useRegister();
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterI>({
    resolver: zodResolver(RegisterSchema),
  });

  const onSubmit = async (data: RegisterI) => {
    try {
      await registerMutation.mutateAsync(data);
      setIsSuccess(true);
    } catch (error) {
      setError("root", {
        message: error instanceof Error ? error.message : "Registration failed",
      });
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