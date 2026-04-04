// Static style constants defined outside component
const dividerStyles = {
  left: "fixed inset-y-0 left-12 w-px bg-slate-200/70 hidden xl:block pointer-events-none",
  right: "fixed inset-y-0 right-12 w-px bg-slate-200/70 hidden xl:block pointer-events-none",
};

/**
 * PageDividers - Decorative vertical dividers on the left and right sides of the page
 * Only visible on extra-large screens (xl breakpoint)
 *
 * @example
 * ```tsx
 * <PageDividers />
 * ```
 */
export function PageDividers() {
  return (
    <>
      <div className={dividerStyles.left} aria-hidden="true" />
      <div className={dividerStyles.right} aria-hidden="true" />
    </>
  );
}
