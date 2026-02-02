import { ShoppingBag } from "lucide-react";
import { Button } from "@/features/ui/button";
import { useRouter } from "next/navigation";

export function OrdersEmptyState() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 border border-purple-100 rounded-2xl p-12 max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 rounded-full">
            <ShoppingBag className="w-12 h-12 text-white" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-gray-800">No Orders Yet</h3>
          <p className="text-gray-600">
            You haven't placed any orders yet. Start creating your custom designs and place your first order!
          </p>
        </div>
        <Button
          onClick={() => router.push("/stamp")}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
        >
          Start Creating
        </Button>
      </div>
    </div>
  );
}
