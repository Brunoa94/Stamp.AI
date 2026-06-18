import { ShoppingBag, Filter, ArrowRight } from "lucide-react";
import { useViewTransitionNavigate } from "@/features/ui/view-transition-link";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Button } from "@/features/ui/button";

interface PropsI {
  variant?: "no-orders" | "no-match";
  onClearFilters?: () => void;
}

export function OrdersEmptyState({
  variant = "no-orders",
  onClearFilters,
}: PropsI) {
  const navigate = useViewTransitionNavigate();
  const isNoMatch = variant === "no-match";

  return (
    <div className="flex items-center justify-center min-h-100 mb-24">
      <div className="w-full max-w-xl bg-white/40 backdrop-blur-md rounded-[3rem] border border-white/60 p-16 flex flex-col items-center text-center shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] relative">
        {/* Icon Container */}
        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-ink rounded-full flex items-center justify-center mb-10 shadow-xl relative group">
          <div className="absolute inset-0 rounded-full bg-cyan/10 scale-125 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          {isNoMatch ? (
            <Filter className="w-12 h-12 sm:w-16 sm:h-16 text-cyan relative z-10" style={{ filter: 'drop-shadow(0 0 8px rgba(34, 211, 238, 0.6))' }} />
          ) : (
            <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 text-cyan relative z-10" style={{ filter: 'drop-shadow(0 0 8px rgba(34, 211, 238, 0.6))' }} />
          )}
        </div>

        {/* Heading */}
        <Heading as="h2" variant="card" className="mb-4">
          {isNoMatch ? "NO ORDERS MATCH" : "NO ORDERS YET"}
        </Heading>

        {/* Description */}
        <Paragraph variant="sm" className="text-[#6b7280] max-w-sm mb-12">
          {isNoMatch
            ? "TRY ADJUSTING OR CLEARING YOUR FILTERS TO SEE MORE RESULTS."
            : "YOU HAVEN'T PLACED ANY ORDERS YET. START CREATING YOUR CUSTOM DESIGNS AND PLACE YOUR FIRST ORDER!"}
        </Paragraph>

        {/* CTA Button */}
        {isNoMatch ? (
          <Button
            variant="brutalist-primary"
            size="lg"
            onClick={onClearFilters}
            className="group"
          >
            CLEAR FILTERS
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        ) : (
          <Button
            variant="brutalist-primary"
            size="lg"
            onClick={() => navigate("/stamp")}
            className="group"
          >
            START CREATING
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        )}
      </div>
    </div>
  );
}
