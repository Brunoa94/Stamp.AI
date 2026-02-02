"use client";

import { Button } from "@/features/ui/button";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export function CreateDesignCard() {
  const router = useRouter();

  return (
    <div className="bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-700 rounded-2xl p-8">
      <div className="flex items-center gap-4 mb-4">
        <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        <h2 className="text-2xl font-bold bg-linear-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
          Create New Design
        </h2>
      </div>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Start creating your next custom design with AI magic
      </p>
      <Button
        onClick={() => router.push("/stamp")}
        className="w-full bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-4 text-lg rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
      >
        <Sparkles className="w-5 h-5 mr-2" />
        Stamp It!
      </Button>
    </div>
  );
}
