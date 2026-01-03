import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, type LoginI } from "@/schemas/auth";
import { useLogin } from "@/hooks/useAuth";

export function useLoginForm() {
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginI>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginI) => {
    try {
      await loginMutation.mutateAsync(data);
    } catch (error) {
      setError("root", {
        message: error instanceof Error ? error.message : "Login failed",
      });
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