import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type LoginI, LoginSchema } from "@/schemas/auth";
import { useLogin } from "@/queries/authQueries";
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
      const captchaToken = await getCaptchaToken();
      await loginMutation.mutateAsync({ credentials: data, captchaToken });
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
