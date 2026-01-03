import { Button } from "@/components/ui/button";
import Link from "next/link";

export function PasswordResetSuccess() {
  return (
    <div className="text-center space-y-4">
      <div className="text-green-600 mb-4">
        <svg
          className="w-16 h-16 mx-auto"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900">
        Password Reset Successful!
      </h3>
      <p className="text-sm text-gray-600">
        Your password has been reset successfully. You will be redirected to the
        login page in 3 seconds.
      </p>
      <Button asChild className="mt-4">
        <Link href="/">Go to Login</Link>
      </Button>
    </div>
  );
}
