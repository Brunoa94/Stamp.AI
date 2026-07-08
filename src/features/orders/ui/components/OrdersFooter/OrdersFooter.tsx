import { OrdersFooterBrand } from "./OrdersFooterBrand";
import { OrdersFooterLinks } from "./OrdersFooterLinks";
import { OrdersFooterSocial } from "./OrdersFooterSocial";

export function OrdersFooter() {
  return (
    <footer className="border-t border-(--color-stamp-divider) bg-white p-12 lg:p-24">
      <div className="flex flex-col items-start justify-between gap-12 lg:flex-row">
        <OrdersFooterBrand />

        <div className="grid grid-cols-2 gap-16 lg:grid-cols-3">
          <OrdersFooterLinks />
          <OrdersFooterSocial />
        </div>
      </div>
    </footer>
  );
}
