import { PageDividers } from "@/features/ui/page-dividers";
import { cartTheme } from "@/theme/components";

interface Props {
  children: React.ReactNode;
}

export function CartPageLayout({ children }: Props) {
  return (
    <div className={cartTheme.page.container}>
      <PageDividers />

      {/* Animated blob background (mobile only) */}
      <div
        className="bg-fluid-cluster pointer-events-none lg:hidden fixed inset-0 z-0"
        aria-hidden="true"
      >
        <div className="dashboard-blob-purple" />
        <div className="dashboard-blob-pink" />
        <div className="dashboard-blob-cyan" />
        <div className="dashboard-blob-indigo" />
      </div>

      <main className={`${cartTheme.page.main} relative z-10`}>{children}</main>
    </div>
  );
}
