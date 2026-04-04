import { Check, Copy, TicketPercent } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { PromoCodeT } from "@/types/promocode";
import { mapPromoToLabel } from "../mappers";

interface PromoCodeCardProps {
  promo: PromoCodeT;
}

export function PromoCodeCard({ promo }: PromoCodeCardProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(promo.code).then(() => {
      setCopied(true);
      toast.success(`"${promo.code}" copied to clipboard`, {
        description: "Paste it at checkout to apply your discount.",
      });
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`Copy promo code ${promo.code}`}
      onClick={handleCopy}
      onKeyDown={(e) =>
        e.key === "Enter" || e.key === " " ? handleCopy() : undefined
      }
      className="shrink-0 cursor-pointer rounded-2xl bg-linear-to-r from-[#7C3AED] via-[#D946EF] to-[#06B6D4] p-0.5 transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]"
    >
      <div className="flex h-30 w-72 items-center justify-between rounded-[15px] border border-white bg-white px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7C3AED]/12 text-[#7C3AED] transition-colors duration-150">
            {copied ? (
              <Check className="h-5 w-5 text-emerald-500" />
            ) : (
              <TicketPercent className="h-5 w-5" />
            )}
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Available now
            </p>
            <p className="font-heading text-xl uppercase text-slate-900">
              {promo.code}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-[#06B6D4]/12 px-3 py-1.5 text-[#0E7490]">
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          <span className="text-[10px] font-bold uppercase tracking-widest">
            {copied ? "Copied!" : mapPromoToLabel(promo.type, promo.value)}
          </span>
        </div>
      </div>
    </article>
  );
}
