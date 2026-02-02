import { Button } from "@/features/ui/button";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export function CreateDesignCard() {
  return (
    <div className="rounded-2xl p-8 transition-all duration-300">
      <div className="flex items-center justify-center gap-3 mb-4">
        <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400 animate-pulse" />
        <h2 className="text-3xl font-bold bg-linear-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
          Create New Design
        </h2>
        <Sparkles className="w-8 h-8 text-pink-600 dark:text-pink-400 animate-pulse" />
      </div>
      <p className="text-gray-700 dark:text-gray-300 mb-6 text-center font-medium">
        Start creating your next custom design with AI magic ✨
      </p>
      <Button
        asChild
        className="w-full bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 text-base rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-purple-500/50"
      >
        <Link href="/stamp">
          <Sparkles className="w-4 h-4 mr-2 animate-spin" />
          Stamp It!
          <Sparkles className="w-4 h-4 ml-2 animate-spin" />
        </Link>
      </Button>
    </div>
  );
}
