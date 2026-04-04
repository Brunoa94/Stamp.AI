export function ProcessingDots() {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-linear-to-br from-violet-500 to-purple-600 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}
