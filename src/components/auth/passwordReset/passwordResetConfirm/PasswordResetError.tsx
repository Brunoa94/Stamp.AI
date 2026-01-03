import { Button } from "@/components/ui/button";
import Link from "next/link";

export function PasswordResetError() {
  return (
    <div className="text-center space-y-4">
      <div className="text-red-600 mb-4">
        <svg
          className="w-16 h-16 mx-auto"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900">Reset Link Invalid</h3>
      <p className="text-sm text-gray-600">
        This password reset link is invalid or has expired. Please request a new
        one.
      </p>
      <Button asChild variant="outline">
        <Link href="/">Back to Home</Link>
      </Button>
    </div>
  );
}
