import { footerTheme } from "@/theme/components";

export function FooterBrand() {
  return (
    <div className={footerTheme.brandWrap}>
      <h2 className={footerTheme.brandText}>
        STAMP
        <span className={footerTheme.brandDot} aria-hidden="true" />
        AI
      </h2>
    </div>
  );
}
