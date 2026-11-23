import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Span } from "@/features/ui/span";
import {
  giftIdeaLabelVariants,
  giftIdeaTileVariants,
} from "@/features/homepage/lib/variants/marketplaceVariants";

interface PropsI {
  src: string;
  label: string;
  size: "large" | "small";
}

/**
 * GiftIdeaTile
 *
 * A rounded occasion photo with a white label pill; opens the design studio.
 * The photo is decorative: the pill names the link.
 */
export function GiftIdeaTile({ src, label, size }: PropsI) {
  return (
    <Link href="/stamp" className={giftIdeaTileVariants({ size })}>
      <Image
        src={src}
        alt=""
        fill
        sizes={size === "large" ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 1024px) 50vw, 25vw"}
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <Span unstyled className={giftIdeaLabelVariants({ size })}>
        {label}
        <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
      </Span>
    </Link>
  );
}
