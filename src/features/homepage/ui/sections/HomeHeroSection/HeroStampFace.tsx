import Image from "next/image";
import { cn } from "@/lib/utils";

interface PropsI {
  src: string;
  /** The reverse side of a flipping stamp, laid over the front */
  isBack?: boolean;
  hasPostmark?: boolean;
}

/**
 * HeroStampFace
 *
 * A perforated cream postage stamp framing one product photo, optionally
 * cancelled with the gold Stamp.ai postmark. The perforation is a CSS mask
 * (globals.css, `.stamp-wall__stamp`).
 */
export function HeroStampFace({ src, isBack = false, hasPostmark = false }: PropsI) {
  return (
    <div
      className={cn(
        "stamp-wall__stamp relative w-36 shrink-0 sm:w-40 xl:w-44",
        isBack && "stamp-wall__stamp--back absolute inset-0",
      )}
    >
      <div className="relative aspect-4/5 overflow-hidden bg-(--color-stamp-white)">
        <Image src={src} alt="" fill sizes="176px" className="stamp-wall__photo object-cover" />
      </div>
      {hasPostmark && (
        <Image
          src="/assets/homepage/postmark.svg"
          alt=""
          width={110}
          height={60}
          className="stamp-wall__postmark absolute -right-6 bottom-6 w-28"
        />
      )}
    </div>
  );
}
