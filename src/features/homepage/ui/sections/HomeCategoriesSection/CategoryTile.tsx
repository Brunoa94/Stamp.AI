import Image from "next/image";
import Link from "next/link";
import { Span } from "@/features/ui/span";

interface PropsI {
  href: string;
  src: string;
  label: string;
}

/**
 * CategoryTile
 *
 * A product photo in a white "stamp" frame with the category name under it;
 * lifts into the offset stamp shadow on hover. The photo is decorative: the
 * label names the link.
 */
export function CategoryTile({ href, src, label }: PropsI) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-xl border border-(--color-stamp-divider) bg-(--color-stamp-white) p-2 pb-3 shadow-(--shadow-stamp-card) transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-(--color-stamp-chocolate)/30 hover:shadow-(--shadow-stamp-card-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-stamp-chocolate)"
    >
      <Span unstyled className="relative block aspect-square w-full overflow-hidden rounded-lg bg-(--color-stamp-sage)">
        <Image
          src={src}
          alt=""
          fill
          sizes="(max-width: 640px) 128px, (max-width: 1024px) 30vw, 15vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Span>
      <Span variant="sm" className="text-center text-(--color-stamp-chocolate)">
        {label}
      </Span>
    </Link>
  );
}
