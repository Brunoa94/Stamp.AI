import { Wand2 } from "lucide-react";
import { ORBIT_ICONS } from "../constants/processingIcons";

export function ProcessingOrbit() {
  return (
    <div className="relative flex items-center justify-center w-36 h-36">
      {/* Glow backdrop */}
      <div className="absolute inset-0 rounded-full bg-linear-to-br from-violet-500/20 via-purple-500/10 to-indigo-500/20 blur-xl animate-pulse" />

      {/* Orbit ring */}
      <div className="absolute inset-0 rounded-full border border-purple-300/30 dark:border-purple-500/20" />

      {/* Orbiting icons */}
      {ORBIT_ICONS.map(({ Icon, label, color, delay, angle }) => (
        <span
          key={label}
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: `rotate(${angle}deg)`,
            animation: `processing-orbit 4.5s linear infinite`,
            animationDelay: delay,
          }}
        >
          <span
            className={`absolute -top-2 flex items-center justify-center w-8 h-8 rounded-full bg-white/80 dark:bg-slate-800/80 shadow-md border border-purple-100 dark:border-purple-900 ${color}`}
            style={{ transform: `rotate(-${angle}deg)` }}
          >
            <Icon className="w-4 h-4" />
          </span>
        </span>
      ))}

      {/* Centre wand */}
      <div className="relative z-10 w-16 h-16 rounded-2xl bg-linear-to-br from-violet-600 to-purple-700 shadow-[0_0_30px_rgba(139,92,246,0.5)] flex items-center justify-center animate-[wiggle_2s_ease-in-out_infinite]">
        <Wand2 className="w-7 h-7 text-white" />
      </div>
    </div>
  );
}
