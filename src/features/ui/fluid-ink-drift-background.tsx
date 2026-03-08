"use client";

export function FluidInkDriftBackground() {
  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: -1 }}
      aria-hidden="true"
    >
      {/* Blob 1: Purple - Top Left */}
      <div
        className="absolute rounded-full animate-drift-1"
        style={{
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, #7C3AED 0%, transparent 70%)",
          filter: "blur(120px)",
          mixBlendMode: "multiply",
          top: "15%",
          left: "20%",
        }}
      />

      {/* Blob 2: Pink - Top Right */}
      <div
        className="absolute rounded-full animate-drift-2"
        style={{
          width: "500px",
          height: "500px",
          background: "radial-gradient(circle, #D946EF 0%, transparent 70%)",
          filter: "blur(120px)",
          mixBlendMode: "multiply",
          top: "10%",
          right: "25%",
        }}
      />

      {/* Blob 3: Cyan - Bottom Left */}
      <div
        className="absolute rounded-full animate-drift-3"
        style={{
          width: "700px",
          height: "700px",
          background: "radial-gradient(circle, #06B6D4 0%, transparent 70%)",
          filter: "blur(120px)",
          mixBlendMode: "multiply",
          bottom: "10%",
          left: "30%",
        }}
      />

      {/* Blob 4: Indigo - Bottom Right */}
      <div
        className="absolute rounded-full animate-drift-4"
        style={{
          width: "450px",
          height: "450px",
          background: "radial-gradient(circle, #4F46E5 0%, transparent 70%)",
          filter: "blur(120px)",
          mixBlendMode: "multiply",
          bottom: "25%",
          right: "15%",
        }}
      />
    </div>
  );
}
