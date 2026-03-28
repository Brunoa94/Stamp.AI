import { CREATION_STEPS } from "../../constants/creationSteps";

export function CreatingStepList() {
  return (
    <ul className="space-y-3 w-full max-w-xs">
      {CREATION_STEPS.map(({ Icon, label, delay }) => (
        <li
          key={label}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/60 dark:bg-slate-800/50 border border-purple-100/70 dark:border-purple-900/50 shadow-sm animate-[fadeInUp_0.5s_ease-out_both]"
          style={{ animationDelay: delay }}
        >
          <span className="shrink-0 w-7 h-7 rounded-lg bg-linear-to-br from-violet-100 to-purple-100 dark:from-violet-900/60 dark:to-purple-900/40 flex items-center justify-center">
            <Icon className="w-4 h-4 text-violet-600 dark:text-violet-400 animate-pulse" />
          </span>
          <span className="text-sm font-medium font-accent text-slate-700 dark:text-slate-300">
            {label}
          </span>
        </li>
      ))}
    </ul>
  );
}
