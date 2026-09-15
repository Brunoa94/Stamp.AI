"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { type RegisterI, RegisterSchema } from "@/schemas/auth";
import { useRegister } from "@/queries/authQueries";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useCaptcha } from "@/hooks/useCaptcha";
import { CAPTCHA_ACTIONS } from "@/lib/security/captcha/constants";

export function useRegisterForm() {
  const registerMutation = useRegister();
  const router = useRouter();
  const { handleError } = useErrorHandler();
  const { getToken: getCaptchaToken, isReady: isCaptchaReady } = useCaptcha({
    action: CAPTCHA_ACTIONS.REGISTER,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterI>({
    resolver: zodResolver(RegisterSchema),
  });

  const onSubmit = async (data: RegisterI) => {
    try {
      const captchaToken = await getCaptchaToken();
      await registerMutation.mutateAsync({ userData: data, captchaToken });

      // Redirect to check-email page with encoded email
      const encodedEmail = encodeURIComponent(data.email);
      router.push(`/auth/check-email?email=${encodedEmail}`);
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
    isCaptchaReady,
  };
}
