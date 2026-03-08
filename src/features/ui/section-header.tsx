import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

// Static style constants defined outside component
const sectionHeaderStyles = {
  container: "mb-6",
  title: "text-xl font-heading font-bold uppercase tracking-tight text-slate-900",
  subtitle: "text-sm text-slate-600 mt-1",
};

/**
 * SectionHeader - A reusable header component for sections
 * Used across checkout, cart, orders, and other feature sections
 *
 * @example
 * ```tsx
 * <SectionHeader title="Payment Details" />
 * <SectionHeader
 *   title="Billing Address"
 *   subtitle="Where should we send your invoice?"
 * />
 * ```
 */
export function SectionHeader({
  title,
  subtitle,
  className,
}: SectionHeaderProps) {
  return (
    <header className={cn(sectionHeaderStyles.container, className)}>
      <h2 className={sectionHeaderStyles.title}>{title}</h2>
      {subtitle && <p className={sectionHeaderStyles.subtitle}>{subtitle}</p>}
    </header>
  );
}
