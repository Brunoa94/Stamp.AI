import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, type LoginI } from "@/schemas/auth";
import { useLogin } from "@/hooks/useAuth";
import { useErrorHandler } from "@/hooks/useErrorHandler";

export function useLoginForm() {
  const loginMutation = useLogin();
  const { handleError } = useErrorHandler();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginI>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginI) => {
    try {
      await loginMutation.mutateAsync(data);
    } catch (error) {
      handleError(error);
    }
  };

  return {
    register,
    handleSubmit,
    onSubmit,
    isPending: loginMutation.isPending,
    errors,
  };
}