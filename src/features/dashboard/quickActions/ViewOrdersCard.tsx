"use client";

import { Button } from "@/features/ui/button";
import { Package } from "lucide-react";
import { useRouter } from "next/navigation";

export function ViewOrdersCard() {
  const router = useRouter();

  return (
    <div className="bg-linear-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-2xl p-8">
      <div className="flex items-center gap-4 mb-4">
        <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        <h2 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
          My Orders
        </h2>
      </div>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        View and track all your orders
      </p>
      <Button
        onClick={() => router.push("/orders")}
        className="w-full bg-linear-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-4 text-lg rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
      >
        <Package className="w-5 h-5 mr-2" />
        View Orders
      </Button>
    </div>
  );
}
