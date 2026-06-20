import { cn } from "@/lib/utils";
import { MobilePageHeader } from "./mobile-page-header";

interface PageHeaderProps {
  title: string;
  description?: string;
  align?: "left" | "center";
  showGradient?: boolean;
  className?: string;
}

// Static style constants defined outside component
const headerStyles = {
  container: "w-full mx-auto mb-12 relative z-20",
  glassCard:
    "bg-white/95 backdrop-blur-none lg:glass-card rounded-xl p-6 md:p-8 border border-slate-200/80 lg:border-white/30 shadow-sm lg:shadow-md lg:bg-white/75 lg:backdrop-blur-md relative z-20",
  content: "flex flex-col gap-3",
  title:
    "font-heading text-[clamp(2.25rem,4vw,3.25rem)] leading-[0.9] tracking-widest font-extrabold uppercase bg-linear-to-r from-[#1A2340] via-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent",
  descriptionWrapper: "flex flex-col md:flex-row md:items-center gap-4",
  gradientBar:
    "h-1.5 w-24 bg-linear-to-r from-[#7C3AED] via-[#4F46E5] to-[#06B6D4] rounded-sm shadow-sm shrink-0",
  description: "font-sans text-md max-w-2xl text-slate-600",
};

export function PageHeader({
  title,
  description,
  align = "left",
  showGradient = true,
  className,
}: PageHeaderProps) {
  return (
    <>
      {/* Mobile header */}
      <MobilePageHeader title={title} description={description} />

      {/* Desktop header */}
      <header
        className={cn(
          headerStyles.container,
          "hidden md:block",
          {
            "text-center": align === "center",
            "text-left": align === "left",
          },
          className,
        )}
      >
        <div className={headerStyles.glassCard}>
          <div className={headerStyles.content}>
            <h1 className={headerStyles.title}>{title}</h1>

            {(description || showGradient) && (
              <div className={headerStyles.descriptionWrapper}>
                {showGradient && (
                  <div
                    className={headerStyles.gradientBar}
                    aria-hidden="true"
                  />
                )}

                {description && (
                  <p className={headerStyles.description}>{description}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
