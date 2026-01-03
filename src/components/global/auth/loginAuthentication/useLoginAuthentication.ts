import { AuthenticateUserSchema } from "@/schemas/auth";
import { AuthenticationService } from "@/services/authenticationService";
import type { AuthenticateUserI, UserSessionI } from "@/types/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Cookies from "universal-cookie";

export default function useLoginAuthentication(onSucess?: () => void) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AuthenticateUserI>({
    resolver: zodResolver(AuthenticateUserSchema),
  });
  const cookies = new Cookies();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (body: AuthenticateUserI): Promise<UserSessionI> => {
      const formData = new FormData();
      formData.set("username", body.username);
      formData.set("password", body.password);

      return AuthenticationService.autheticateUser(formData);
    },
    onSuccess: (response: UserSessionI) => {
      cookies.set("jwt-session-token", response.access_token, {
        secure: true,
        sameSite: "strict",
      });
      toast.success("User logged in", {
        duration: 3000,
      });
      onSucess?.();
    },
    onError: (error) => {
      toast.error("Something went wrong", {
        description: error.message,
        duration: 3000,
      });
    },
  });

  const onAuthenticate = async (body: AuthenticateUserI) => {
    await mutateAsync(body);
  };

  return {
    register,
    onAuthenticate,
    setValue,
    handleSubmit,
    errors,
    isPending,
  };
}
