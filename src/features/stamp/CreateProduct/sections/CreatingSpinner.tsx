import { Package } from "lucide-react";

export function CreatingSpinner() {
  return (
    <div className="relative flex h-34 w-34 items-center justify-center">
      <div className="absolute inset-0 rounded-full border border-primary/25 bg-primary/8 animate-[pulse_2.2s_ease-in-out_infinite]" />
      <div className="absolute inset-3 rounded-full border border-primary/20 animate-[ping_2.8s_ease-in-out_infinite]" />

      <div className="relative z-10 flex h-18 w-18 items-center justify-center rounded-2xl border border-primary/25 bg-linear-to-br from-violet-600 to-indigo-700 shadow-[0_12px_32px_rgba(99,102,241,0.45)] animate-[float_2.8s_ease-in-out_infinite]">
        <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-white/30 to-transparent opacity-60" />
        <Package className="relative z-10 h-8 w-8 text-white" />
      </div>
    </div>
  );
}
