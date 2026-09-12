"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type RegisterI, RegisterSchema } from "@/schemas/auth";
import { useRegister } from "@/queries/authQueries";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useCaptcha } from "@/hooks/useCaptcha";
import { CAPTCHA_ACTIONS } from "@/lib/security/captcha/constants";

export function useRegisterForm() {
  const registerMutation = useRegister();
  const [isSuccess, setIsSuccess] = useState(false);
  const { handleError, handleSuccess } = useErrorHandler();
  const t = useTranslations("auth.register");
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

      setIsSuccess(true);

      handleSuccess(t("successToast"));
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
    isCaptchaReady,
  };
}
