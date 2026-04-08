import { PageDividers } from "@/features/ui/page-dividers";
import { notFoundTheme } from "@/theme/components";
import { HelpCircle } from "lucide-react";

export default function NotFound() {
  return (
    <section className={notFoundTheme.page} aria-label="Page not found">
      <PageDividers />

      <div className={notFoundTheme.wrapper}>
        <div className={notFoundTheme.titleRow}>
          <span className={notFoundTheme.titleIconWrap} aria-hidden="true">
            <HelpCircle className={notFoundTheme.titleIcon} />
          </span>
          <h1 className={notFoundTheme.title}>Page Not Found</h1>
        </div>

        <div className={notFoundTheme.numberWrap}>
          <span className={notFoundTheme.numberGlow}>404</span>
          <span className={notFoundTheme.numberMain}>404</span>
        </div>
      </div>
    </section>
  );
}
