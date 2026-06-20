import { OrderWithItemsT, Address } from "@/types/order";
import { CustomerInfoHeader } from "./CustomerInfoHeader";
import { ShippingAddressCard } from "./ShippingAddressCard";
import { BillingAddressCard } from "./BillingAddressCard";
import { PaymentMethodCard } from "./PaymentMethodCard";

interface PropsI {
  order: OrderWithItemsT;
}

export function CustomerInfoSection({ order }: PropsI) {
  if (
    !order.shipping_address &&
    !order.billing_address &&
    !order.customer_name
  ) {
    return null;
  }

  const shippingAddress = order.shipping_address as Address | null;
  const billingAddress = order.billing_address as Address | null;

  return (
    <section className="space-y-4 border-b border-ink/10 pb-8">
      <CustomerInfoHeader />

      <div className="grid md:grid-cols-2 gap-4">
        {shippingAddress && (
          <ShippingAddressCard
            shippingAddress={shippingAddress}
            customerName={order.customer_name}
          />
        )}

        {billingAddress && (
          <BillingAddressCard billingAddress={billingAddress} />
        )}
      </div>

      {order.payment_method && (
        <PaymentMethodCard paymentMethod={order.payment_method} />
      )}
    </section>
  );
}
