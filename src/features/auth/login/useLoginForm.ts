import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, type LoginI } from "@/schemas/auth";
import { useLogin } from "@/hooks/useAuth";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useCaptcha } from "@/hooks/useCaptcha";
import { CAPTCHA_ACTIONS } from "@/lib/security/captcha/constants";

export function useLoginForm() {
  const loginMutation = useLogin();
  const { handleError } = useErrorHandler();
  const { getToken: getCaptchaToken, isReady: isCaptchaReady } = useCaptcha({
    action: CAPTCHA_ACTIONS.LOGIN,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginI>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginI) => {
    try {
      // Get CAPTCHA token for bot protection
      const captchaToken = await getCaptchaToken();

      // Note: The captchaToken should be verified server-side in the auth service
      // For now, we pass the credentials to the existing login mutation
      // TODO: Update AuthService.login to accept and verify captchaToken
      if (captchaToken) {
        console.debug("[Auth] CAPTCHA token obtained for login");
      }

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
    isCaptchaReady,
    errors,
  };
}