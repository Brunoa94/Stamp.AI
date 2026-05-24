import { Package } from "lucide-react";

export function CreatingSpinner() {
  return (
    <div className="relative flex h-34 w-34 items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-linear-to-br from-violet-500/15 via-purple-500/8 to-indigo-500/15 blur-xl" />
      <div className="absolute inset-0 rounded-full border border-white/40 bg-white/20 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(124,58,237,0.12),inset_0_1px_1px_0_rgba(255,255,255,0.5)] animate-[pulse_2.2s_ease-in-out_infinite]" />
      <div className="absolute inset-3 rounded-full border border-violet-300/25 dark:border-violet-500/15 animate-[ping_2.8s_ease-in-out_infinite]" />

      <div className="relative z-10 flex h-18 w-18 items-center justify-center rounded-2xl border border-white/30 bg-linear-to-br from-violet-600 to-purple-700 shadow-[0_10px_30px_rgba(124,58,237,0.35)] animate-[float_2.8s_ease-in-out_infinite]">
        <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-white/25 to-transparent opacity-60" />
        <Package className="relative z-10 h-8 w-8 text-white" />
      </div>
    </div>
  );
}
