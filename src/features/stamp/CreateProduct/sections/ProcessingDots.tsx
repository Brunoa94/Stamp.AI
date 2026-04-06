export function ProcessingDots() {
  return (
    <div className="flex items-center gap-3" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="ai-synthesis-pulse-dot w-3 h-3 rounded-full bg-violet-500"
          style={{
            animation: "ai-synthesis-dot-pulse 1.2s ease-in-out infinite",
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}
