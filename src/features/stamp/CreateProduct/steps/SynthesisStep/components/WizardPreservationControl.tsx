import { PercentageRangeSlider } from "@/features/ui/percentage-range-slider";
import { useCreateProductSubscriberActions } from "../../../context/actions";
import { CreateProductSelectors } from "../../../context/selectors";
import { getPreservationBoxStyle } from "../../../utils/promptCustomization";

interface WizardPreservationControlProps {
  disabled: boolean;
}

export function WizardPreservationControl({
  disabled,
}: WizardPreservationControlProps) {
  const preservation = CreateProductSelectors.preservation();
  const { handleSetPreservation } = useCreateProductSubscriberActions();
  const preservationBoxStyle = getPreservationBoxStyle(preservation);

  return (
    <div
      className="relative z-10 mb-10 mt-10 flex flex-col gap-6 rounded-xl border border-white/40 bg-white/60 p-6 shadow-[0_8px_24px_rgba(26,35,64,0.08),inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-xl sm:flex-row sm:items-center"
      style={{
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div className="w-full flex-1">
        <label className="mb-4 block text-[13px] font-medium text-[#1A2340]">
          Preserve original image percentage
        </label>

        <PercentageRangeSlider
          value={preservation}
          onChange={handleSetPreservation}
          disabled={disabled}
        />
      </div>

      <div
        className="h-18 w-18 shrink-0 rounded-lg transition-all duration-150"
        style={{
          background: preservationBoxStyle,
          boxShadow:
            "0 8px 24px rgba(123, 92, 245, 0.3), inset 0 1px 0 rgba(255,255,255,0.3)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        }}
      >
        <div className="flex h-full w-full flex-col items-center justify-center">
          <span className="font-['Cabinet_Grotesk'] text-[16px] font-bold text-white">
            {preservation}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">
            %
          </span>
        </div>
      </div>
    </div>
  );
}
