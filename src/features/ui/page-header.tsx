import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  align?: "left" | "center";
  showGradient?: boolean;
  className?: string;
}

// Static style constants defined outside component
const headerStyles = {
  container: "w-full max-w-7xl mx-auto mb-12 relative z-10",
  glassCard: "glass-card rounded-xl p-6 md:p-8",
  content: "flex flex-col gap-3",
  title: "text-4xl md:text-6xl font-normal font-heading text-slate-900 tracking-wide",
  descriptionWrapper: "flex flex-col md:flex-row md:items-center gap-4",
  gradientBar: "h-1.5 w-24 bg-linear-to-r from-[#7C3AED] via-[#4F46E5] to-[#06B6D4] rounded-sm shadow-sm shrink-0",
  description: "text-sm md:text-lg leading-relaxed font-light max-w-2xl font-accent italic text-purple-950",
};

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
        headerStyles.container,
        {
          "text-center": align === "center",
          "text-left": align === "left",
        },
        className
      )}
    >
      <div className={headerStyles.glassCard}>
        <div className={headerStyles.content}>
          <h1 className={headerStyles.title}>
            {title}
          </h1>

          {(description || showGradient) && (
            <div className={headerStyles.descriptionWrapper}>
              {showGradient && (
                <div
                  className={headerStyles.gradientBar}
                  aria-hidden="true"
                />
              )}

              {description && (
                <p className={headerStyles.description}>
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
