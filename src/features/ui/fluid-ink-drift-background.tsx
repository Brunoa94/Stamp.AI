"use client";

// Static blob configuration defined outside component for performance
const blobs = [
  {
    id: "purple-blob",
    className: "animate-drift-1",
    width: "650px",
    height: "650px",
    background: "radial-gradient(circle, rgba(124, 58, 237, 0.65) 0%, rgba(139, 92, 246, 0.35) 40%, transparent 70%)",
    top: "10%",
    left: "15%",
  },
  {
    id: "pink-blob",
    className: "animate-drift-2",
    width: "550px",
    height: "550px",
    background: "radial-gradient(circle, rgba(217, 70, 239, 0.6) 0%, rgba(236, 72, 153, 0.3) 40%, transparent 70%)",
    top: "5%",
    right: "20%",
  },
  {
    id: "cyan-blob",
    className: "animate-drift-3",
    width: "750px",
    height: "750px",
    background: "radial-gradient(circle, rgba(6, 182, 212, 0.7) 0%, rgba(34, 211, 238, 0.4) 40%, transparent 70%)",
    bottom: "5%",
    left: "25%",
  },
  {
    id: "indigo-blob",
    className: "animate-drift-4",
    width: "500px",
    height: "500px",
    background: "radial-gradient(circle, rgba(79, 70, 229, 0.62) 0%, rgba(99, 102, 241, 0.32) 40%, transparent 70%)",
    bottom: "20%",
    right: "12%",
  },
  {
    id: "orange-blob",
    className: "animate-drift-1",
    width: "400px",
    height: "400px",
    background: "radial-gradient(circle, rgba(255, 140, 66, 0.5) 0%, rgba(251, 146, 60, 0.25) 40%, transparent 70%)",
    top: "50%",
    left: "50%",
  },
] as const;

export function FluidInkDriftBackground() {
  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: -1 }}
      aria-hidden="true"
    >
      {blobs.map(({ id, className, width, height, background, ...position }) => (
        <div
          key={id}
          className={`absolute rounded-full ${className}`}
          style={{
            width,
            height,
            background,
            mixBlendMode: "multiply",
            willChange: "transform, opacity, filter",
            ...position,
          }}
        />
      ))}
    </div>
  );
}
