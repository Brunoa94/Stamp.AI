import { Wand2 } from "lucide-react";
import { ORBIT_ICONS } from "../constants/processingIcons";

export function ProcessingOrbit() {
  return (
    <div
      className="relative flex items-center justify-center w-[260px] h-[260px]"
      aria-hidden="true"
    >
      {/* Soft glow backdrop */}
      <div className="absolute inset-0 rounded-full bg-linear-to-br from-violet-500/15 via-purple-500/8 to-indigo-500/15 blur-2xl" />

      {/* Orbiting icon chips */}
      {ORBIT_ICONS.map(({ Icon, label, delay }) => (
        <span
          key={label}
          className="ai-synthesis-orbit-icon absolute flex items-center justify-center w-12 h-12 rounded-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-white/40 dark:border-white/15 shadow-[0_4px_16px_rgba(26,35,64,0.1),inset_0_1px_0_rgba(255,255,255,0.5)] text-violet-500 dark:text-violet-400"
          style={{
            animation: "ai-synthesis-orbit 8s linear infinite",
            animationDelay: delay,
          }}
        >
          <Icon className="w-5 h-5" />
        </span>
      ))}

      {/* Central wand box */}
      <div
        className="ai-synthesis-central-box relative z-10 w-24 h-24 rounded-2xl bg-linear-to-br from-violet-600 to-purple-700 flex items-center justify-center"
        style={{ animation: "ai-synthesis-central-pulse 3s ease-in-out infinite" }}
      >
        <Wand2 className="w-10 h-10 text-white" />
      </div>
    </div>
  );
}
