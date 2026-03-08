import Link from "next/link";
import { dashboardTheme } from "@/theme/components";

export function StampCtaCard() {
  return (
    <section className={dashboardTheme.cta.card}>
      <div className="max-w-md">
        <h2 className={dashboardTheme.cta.title}>
          Ready for your next masterpiece?
        </h2>
        <p className={dashboardTheme.cta.description}>
          Unlock your creativity with our latest AI engine. Premium quality
          fabrics are waiting.
        </p>
      </div>
      <Link href="/stamp" className={dashboardTheme.cta.button}>
        Stamp It!
      </Link>
    </section>
  );
}
