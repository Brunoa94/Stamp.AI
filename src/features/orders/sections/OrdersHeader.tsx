import { Button } from "@/features/ui/button";
import { Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { componentThemes } from "@/theme";
import { cn } from "@/lib/utils";

export function OrdersHeader() {
  const router = useRouter();

  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div className="space-y-1">
        <h1 className={cn(componentThemes.text.heading, "text-3xl")}>My Orders</h1>
        <p className="text-gray-500 font-medium">View and track your order history</p>
      </div>

      <Button
        onClick={() => router.push("/dashboard")}
        variant="outline"
        className="flex items-center gap-2 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 font-semibold shadow-sm hover:shadow-md transition-all rounded-xl"
      >
        <Home className="w-4 h-4" />
        Back to Dashboard
      </Button>
    </header>
  );
}
