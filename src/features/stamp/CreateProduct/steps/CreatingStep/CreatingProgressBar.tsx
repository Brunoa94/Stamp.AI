export function CreatingProgressBar() {
  return (
    <div className="w-full max-w-xs">
      <div className="h-1.5 w-full rounded-full bg-purple-100 dark:bg-purple-900/40 overflow-hidden">
        <div className="h-full rounded-full bg-linear-to-r from-violet-500 via-purple-500 to-indigo-500 animate-[creating-progress_3s_ease-in-out_infinite]" />
      </div>
      <p className="mt-3 text-center text-xs font-accent text-slate-400 dark:text-slate-500 italic">
        Your unique design is almost ready… ✨
      </p>
    </div>
  );
}
