import { Package } from "lucide-react";
import { componentThemes } from "@/theme";
import { cn } from "@/lib/utils";

export function OrdersHeader() {
  return (
    <header className="mb-8">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <Package className="w-8 h-8 text-purple-600" />
          <h1 className={cn(componentThemes.text.heading, "text-3xl mb-0")}>My Orders</h1>
        </div>
        <p className="text-gray-500 font-medium">View and track your order history</p>
      </div>
    </header>
  );
}
