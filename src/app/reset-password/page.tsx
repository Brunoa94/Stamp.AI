import { Suspense } from "react";
import { PasswordResetConfirmForm } from "@/features/auth/passwordReset/passwordResetConfirm/PasswordResetConfirmForm";
import { PasswordResetConfirmSkeleton } from "@/features/auth/passwordReset/passwordResetConfirm/PasswordResetConfirmSkeleton";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your new password below
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <Suspense fallback={<PasswordResetConfirmSkeleton />}>
            <PasswordResetConfirmForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
