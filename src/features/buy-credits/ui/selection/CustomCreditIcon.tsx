import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  creditIconTileVariants,
  creditOptionIconVariants,
} from "../../lib/variants/creditOptionVariants";

interface PropsI {
  isSelected: boolean;
}

/** Coin icon tile at the start of the custom credit amount option. */
export function CustomCreditIcon({ isSelected }: PropsI) {
  return (
    <div className={creditIconTileVariants({ selected: isSelected })}>
      <Coins
        className={cn("w-5 h-5", creditOptionIconVariants({ selected: isSelected }))}
      />
    </div>
  );
}
