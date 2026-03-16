"use client";

import { useRegisterForm } from "./useRegisterForm";
import { RegistrationSuccessMessage } from "./RegistrationSuccessMessage";
import { DialogContent } from "@/features/ui/dialog";
import { RegisterDialogHeader } from "./components/RegisterDialogHeader";
import { RegisterCredentialsFields } from "./components/RegisterCredentialsFields";
import { RegisterFormActions } from "./components/RegisterFormActions";
import { RegisterLoginFooter } from "./components/RegisterLoginFooter";

export function RegisterForm() {
  const { register, handleSubmit, onSubmit, isPending, errors, isSuccess } =
    useRegisterForm();

  if (isSuccess) {
    return <RegistrationSuccessMessage />;
  }

  return (
    <DialogContent
      showCloseButton={false}
      className="max-w-[calc(100%-2rem)] border-none bg-transparent p-0 shadow-none sm:max-w-xl"
    >
      <div className="relative overflow-hidden rounded-3xl border border-white bg-white/92 p-8 shadow-[0_25px_50px_-12px_rgba(15,23,42,0.25)] backdrop-blur-2xl md:p-10">
        <RegisterDialogHeader />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <RegisterCredentialsFields register={register} errors={errors} />

          {errors.root?.message && (
            <p role="alert" className="text-sm text-red-600">
              {errors.root.message}
            </p>
          )}

          <RegisterFormActions isPending={isPending} />
        </form>

        <RegisterLoginFooter />
      </div>
    </DialogContent>
  );
}
