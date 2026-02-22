import { ShoppingBag } from "lucide-react";
import { Button } from "@/features/ui/button";
import { useRouter } from "next/navigation";

export function OrdersEmptyState() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 border border-gray-200 rounded-2xl p-12 max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-gradient-to-br from-slate-600 to-gray-700 p-6 rounded-full">
            <ShoppingBag className="w-12 h-12 text-white" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-gray-800">No Orders Yet</h3>
          <p className="text-gray-600">
            You haven't placed any orders yet. Start creating your custom
            designs and place your first order!
          </p>
        </div>
        <Button
          onClick={() => router.push("/stamp")}
          className="bg-gradient-to-r from-slate-600 to-gray-700 hover:from-slate-700 hover:to-gray-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
        >
          Start Creating
        </Button>
      </div>
    </div>
  );
}
