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
      <div className="flex flex-col gap-4">
        <h1 className="text-5xl md:text-7xl font-normal font-heading text-slate-900 tracking-wide">
          {title}
        </h1>

        {(description || showGradient) && (
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {showGradient && (
              <div
                className="h-2 w-32 bg-linear-to-r from-[#7C3AED] via-[#4F46E5] to-[#06B6D4] rounded-sm shadow-sm shrink-0"
                aria-hidden="true"
              />
            )}

            {description && (
              <p className="text-sm md:text-lg text-slate-400 leading-relaxed font-light max-w-2xl font-accent italic">
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
