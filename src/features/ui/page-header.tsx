import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  align?: "left" | "center";
  showGradient?: boolean;
  className?: string;
}

export function PageHeader({
  title,
  description,
  align = "left",
  showGradient = true,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "w-full max-w-7xl mx-auto mb-12 relative z-10",
        {
          "text-center": align === "center",
          "text-left": align === "left",
        },
        className
      )}
    >
      <div className="glass-card rounded-xl p-6 md:p-8">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl md:text-5xl font-normal font-heading text-slate-900 tracking-wide">
            {title}
          </h1>

          {(description || showGradient) && (
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {showGradient && (
                <div
                  className="h-1.5 w-24 bg-linear-to-r from-[#7C3AED] via-[#4F46E5] to-[#06B6D4] rounded-sm shadow-sm shrink-0"
                  aria-hidden="true"
                />
              )}

              {description && (
                <p
                  className="text-xs md:text-base leading-relaxed font-light max-w-2xl font-accent italic bg-gradient-to-r from-purple-900 via-purple-700 to-purple-900 bg-clip-text text-transparent"
                  style={{
                    filter: 'drop-shadow(0 0 8px rgba(124, 58, 237, 0.3)) drop-shadow(0 0 12px rgba(139, 92, 246, 0.2))',
                    WebkitTextStroke: '0.3px rgba(88, 28, 135, 0.1)',
                  }}
                >
                  {description}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
