import clsx from "clsx";
import { Grid3X3 } from "lucide-react";
import { Button } from "@/features/ui/button";
import { ART_STYLES } from "@/features/stamp/CreateProduct/lib/constants/promptStyles";
import { useCreateProductSubscriberActions } from "@/features/stamp/CreateProduct/lib/context/actions";
import { CreateProductSelectors } from "@/features/stamp/CreateProduct/lib/context/selectors";
import { getArtStyleIcon } from "@/features/stamp/CreateProduct/lib/utils/promptCustomization";

interface WizardArtStyleSelectorProps {
  disabled: boolean;
}

export function WizardArtStyleSelector({
  disabled,
}: WizardArtStyleSelectorProps) {
  const selectedStyle = CreateProductSelectors.selectedStyle();
  const { handleSetSelectedStyle } = useCreateProductSubscriberActions();

  return (
    <div className="relative z-10">
      <h4 className="mb-4 text-[11px] uppercase tracking-wider text-[#888799]">
        Select Style
      </h4>

      <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-4 sm:gap-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {ART_STYLES.map((style) => {
          const isActive = selectedStyle === style.id;

          return (
            <Button
              key={style.id}
              type="button"
              disabled={disabled}
              onClick={() => handleSetSelectedStyle(style.id)}
              className={clsx(
                "group h-30 w-30 shrink-0 snap-start overflow-hidden rounded-xl border bg-white/80 text-left transition-all duration-200 sm:h-35 sm:w-35 disabled:cursor-not-allowed disabled:opacity-60 flex flex-col",
                isActive
                  ? "border-2 border-[#7B5CF5]/60 shadow-[0_12px_40px_rgba(123,92,245,0.25),inset_0_2px_4px_rgba(123,92,245,0.1)]"
                  : "border-white/40 shadow-[0_4px_16px_rgba(26,35,64,0.06),inset_0_1px_0_rgba(255,255,255,0.3)] hover:-translate-y-1 hover:border-[#7B5CF5]/50 hover:shadow-[0_12px_32px_rgba(123,92,245,0.2),inset_0_1px_0_rgba(255,255,255,0.4)]",
              )}
              style={{
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
            >
              <div
                className="flex h-3/5 w-full rounded-md items-center justify-center"
                style={{ background: style.gradient }}
              >
                {getArtStyleIcon(style.id)}
              </div>
              <div className="flex h-2/5 items-center justify-center border-t border-white/40 px-2 text-center font-heading text-[11px] font-semibold tracking-widest text-[#1A2340] sm:text-[12px]">
                {style.label}
              </div>
            </Button>
          );
        })}

        <Button
          type="button"
          disabled={disabled}
          className="flex h-30 w-30 shrink-0 snap-start flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#7B5CF5]/40 bg-white/60 text-[#7B5CF5] shadow-[0_4px_16px_rgba(26,35,64,0.06)] transition-all duration-200 sm:h-35 sm:w-35 hover:-translate-y-1 hover:border-[#4DD9E8]/60 hover:bg-white/85 hover:shadow-[0_12px_32px_rgba(77,217,232,0.2)] disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <Grid3X3 className="h-6 w-6 sm:h-7 sm:w-7" />
          <span className="text-[10px] font-semibold uppercase tracking-wider sm:text-[11px]">
            Browse
          </span>
        </Button>
      </div>
    </div>
  );
}
