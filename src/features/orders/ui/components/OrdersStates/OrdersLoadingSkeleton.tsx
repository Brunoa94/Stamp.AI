import { Shimmer } from "@/features/ui/shimmer";
import { PageContainer } from "@/shared/ui/PageContainer";

export function OrdersLoadingSkeleton() {
  return (
    <section className="orders-terminal relative z-10 px-8 lg:px-24 py-16 lg:py-24">
      <PageContainer>
        <div className="space-y-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-6">
            <div className="space-y-4">
              <Shimmer className="h-1.5 w-20 bg-brandPurple/30" />
              <Shimmer className="h-16 md:h-20 w-64 md:w-80" />
              <Shimmer className="h-4 w-56 md:w-80" />
            </div>

            <div className="flex items-center gap-2 border border-ink/10 p-1 bg-white">
              <Shimmer className="h-12 w-12" />
              <Shimmer className="h-12 w-12" />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mb-2">
            <Shimmer className="h-10 w-24 md:w-32 rounded-lg" />
            <Shimmer className="h-10 w-24 md:w-32 rounded-lg" />
            <Shimmer className="h-10 w-24 md:w-32 rounded-lg" />
            <Shimmer className="h-10 w-24 md:w-32 rounded-lg" />
          </div>

          <ul className="space-y-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <li
                key={index}
                className="border border-ink/10 bg-white p-6 lg:p-10"
              >
                <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[200px_1fr] lg:gap-10 items-start">
                  <Shimmer className="h-[200px] w-full lg:w-[200px] rounded-none" />

                  <div className="w-full space-y-8">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-2">
                        <Shimmer className="h-10 w-56" />
                        <Shimmer className="h-3 w-40" />
                      </div>
                      <Shimmer className="h-7 w-28 rounded-full" />
                    </div>

                    <div className="grid grid-cols-2 gap-8 border-y border-ink/5 py-6 md:grid-cols-4">
                      {Array.from({ length: 4 }).map((_, statIndex) => (
                        <div key={statIndex} className="space-y-2">
                          <Shimmer className="h-3 w-16" />
                          <Shimmer className="h-5 w-20" />
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-4 pt-2">
                      <Shimmer className="h-10 w-36 rounded-md" />
                      <Shimmer className="h-10 w-36 rounded-md" />
                      <Shimmer className="h-10 w-24 rounded-md" />
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
