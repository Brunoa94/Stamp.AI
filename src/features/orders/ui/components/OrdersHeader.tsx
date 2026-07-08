import { OrdersHeaderLogo } from "./OrdersHeaderLogo";
import { OrdersHeaderCta } from "./OrdersHeaderCta";
import { OrdersHeaderNav } from "./OrdersHeaderNav";

export function OrdersHeader() {
  return (
    <header className="fixed left-0 top-0 z-50 flex h-24 w-full items-center justify-between border-b border-(--color-stamp-divider) bg-(--color-stamp-off-white)/80 px-6 backdrop-blur-md md:px-12">
      <OrdersHeaderLogo />
      <OrdersHeaderCta />
      <OrdersHeaderNav />
    </header>
  );
}
