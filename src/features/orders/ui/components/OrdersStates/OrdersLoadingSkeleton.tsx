import { Shimmer } from "@/features/ui/shimmer";
import { PageContainer } from "@/shared/ui/PageContainer";
import { ordersLoadingTheme } from "@/features/orders/styles/ordersTheme";

export function OrdersLoadingSkeleton() {
  return (
    <section className="orders-terminal relative z-10 px-8 lg:px-24 py-16 lg:py-24">
      <PageContainer>
        <div className={ordersLoadingTheme.container}>
          <div className={ordersLoadingTheme.headerRow}>
            <div className={ordersLoadingTheme.titleStack}>
              <Shimmer
                className={ordersLoadingTheme.titleLine}
                style={{ backgroundColor: "rgb(124 58 237 / 0.3)" }}
              />
              <Shimmer className={ordersLoadingTheme.title} />
              <Shimmer className={ordersLoadingTheme.subtitle} />
            </div>

            <div className={ordersLoadingTheme.controlsWrap}>
              <Shimmer className={ordersLoadingTheme.controlButton} />
              <Shimmer className={ordersLoadingTheme.controlButton} />
            </div>
          </div>

          <div className={ordersLoadingTheme.filtersRow}>
            <Shimmer className={ordersLoadingTheme.filterPill} />
            <Shimmer className={ordersLoadingTheme.filterPill} />
            <Shimmer className={ordersLoadingTheme.filterPill} />
            <Shimmer className={ordersLoadingTheme.filterPill} />
          </div>

          <ul className={ordersLoadingTheme.list}>
            {Array.from({ length: 5 }).map((_, index) => (
              <li key={index} className={ordersLoadingTheme.card}>
                <div className={ordersLoadingTheme.cardGrid}>
                  <Shimmer className={ordersLoadingTheme.image} />

                  <div className={ordersLoadingTheme.content}>
                    <div className={ordersLoadingTheme.topRow}>
                      <div className={ordersLoadingTheme.titleBlock}>
                        <Shimmer className={ordersLoadingTheme.cardTitle} />
                        <Shimmer className={ordersLoadingTheme.cardMeta} />
                      </div>
                      <Shimmer className={ordersLoadingTheme.status} />
                    </div>

                    <div className={ordersLoadingTheme.statsGrid}>
                      <div className="space-y-2">
                        <Shimmer className={ordersLoadingTheme.statLabel} />
                        <Shimmer className={ordersLoadingTheme.statValue} />
                      </div>
                      <div className="space-y-2">
                        <Shimmer className={ordersLoadingTheme.statLabel} />
                        <Shimmer className={ordersLoadingTheme.statValue} />
                      </div>
                      <div className="space-y-2">
                        <Shimmer className={ordersLoadingTheme.statLabel} />
                        <Shimmer className={ordersLoadingTheme.statValue} />
                      </div>
                      <div className="space-y-2">
                        <Shimmer className={ordersLoadingTheme.statLabel} />
                        <Shimmer className={ordersLoadingTheme.statValue} />
                      </div>
                    </div>

                    <div className={ordersLoadingTheme.actionsRow}>
                      <Shimmer className={ordersLoadingTheme.actionPrimary} />
                      <Shimmer className={ordersLoadingTheme.actionSecondary} />
                      <Shimmer className={ordersLoadingTheme.actionDestructive} />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </PageContainer>
    </section>
  );
}
