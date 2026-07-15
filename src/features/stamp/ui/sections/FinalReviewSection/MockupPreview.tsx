import Image from "next/image";

/**
 * MockupPreview
 *
 * Left panel showing the final product mockup with sealed badge
 */

interface PropsI {
  mockupUrl: string;
}

export function MockupPreview({ mockupUrl }: PropsI) {
  return (
    <div className="p-6 md:p-12 lg:p-24 flex items-center justify-center bg-(--color-stamp-divider)/5 border-r border-(--color-stamp-divider)">
      <div className="w-full max-w-md bg-white p-6 shadow-2xl relative rotate-1 group hover:rotate-0 transition-transform duration-1000">
        <div className="aspect-square bg-(--color-stamp-cream) flex items-center justify-center overflow-hidden mb-6 relative">
          <Image
            src={mockupUrl}
            alt="Final product mockup"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 448px"
          />
        </div>
        <div className="absolute top-10 left-10">
          <span className="px-3 py-1 bg-white/80 backdrop-blur-sm border border-(--color-stamp-divider) text-[8px] font-bold uppercase tracking-widest">
            Preview Sealed
          </span>
        </div>
      </div>
    </div>
  );
}
