import { Button } from "@/features/ui/button";
import { User } from "lucide-react";
import Link from "next/link";

export function ProfileCard() {
  return (
    <div className="bg-linear-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-2 border-emerald-200 dark:border-emerald-700 rounded-2xl p-8">
      <div className="flex items-center gap-4 mb-4">
        <User className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        <h2 className="text-2xl font-bold bg-linear-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
          My Profile
        </h2>
      </div>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        View and manage your account settings
      </p>
      <Button
        asChild
        className="w-full bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-4 text-lg rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
      >
        <Link href="/profile">
          <User className="w-5 h-5 mr-2" />
          View Profile
        </Link>
      </Button>
    </div>
  );
}
