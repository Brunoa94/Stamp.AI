import { Package } from "lucide-react";

export function CreatingSpinner() {
  return (
    <div className="relative flex items-center justify-center w-28 h-28">
      {/* Layered glow rings */}
      <div className="absolute inset-0 rounded-full bg-linear-to-br from-purple-500/25 to-indigo-500/15 blur-2xl animate-pulse" />
      <div
        className="absolute inset-2 rounded-full border-2 border-dashed border-purple-300/50 dark:border-purple-600/40 animate-spin"
        style={{ animationDuration: "8s" }}
      />
      <div
        className="absolute inset-5 rounded-full border border-indigo-200/60 dark:border-indigo-700/40 animate-spin"
        style={{ animationDuration: "5s", animationDirection: "reverse" }}
      />

      {/* Centre icon */}
      <div className="relative z-10 w-14 h-14 rounded-2xl bg-linear-to-br from-purple-600 to-indigo-700 shadow-[0_0_28px_rgba(139,92,246,0.55)] flex items-center justify-center animate-[float_3s_ease-in-out_infinite]">
        <Package className="w-7 h-7 text-white" />
      </div>
    </div>
  );
}
