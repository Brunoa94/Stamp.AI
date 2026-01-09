import Link from "next/link";
import { Button } from "@/features/ui/button";

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Authentication Error</h1>
          <p className="mt-2 text-sm text-gray-600">
            There was an error processing your authentication request.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              This could happen if the link has expired or has already been used.
            </p>

            <div className="flex flex-col gap-3">
              <Button asChild>
                <Link href="/">
                  Return to Home
                </Link>
              </Button>

              <Button asChild variant="outline">
                <Link href="/auth/reset">
                  Request New Password Reset
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}