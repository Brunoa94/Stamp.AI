import { OrderWithItemsT, Address } from "@/types/order";
import { MapPin, CreditCard } from "lucide-react";
import { componentThemes } from "@/theme";

interface Props {
  order: OrderWithItemsT;
}

export function CustomerInfoSection({ order }: Props) {
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
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <MapPin className="w-5 h-5 text-slate-600" />
        <h3 className={componentThemes.text.subheading}>
          Customer Information
        </h3>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Shipping Address */}
        {shippingAddress && (
          <div className="bg-purple-50/50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">
              Shipping Address
            </h4>
            <div className="text-sm text-gray-600 space-y-1">
              {order.customer_name && (
                <p className="font-medium">{order.customer_name}</p>
              )}
              {shippingAddress.address1 && <p>{shippingAddress.address1}</p>}
              {shippingAddress.address2 && <p>{shippingAddress.address2}</p>}
              <p>
                {shippingAddress.city && `${shippingAddress.city}, `}
                {shippingAddress.region && `${shippingAddress.region} `}
                {shippingAddress.zip}
              </p>
              {shippingAddress.country && <p>{shippingAddress.country}</p>}
            </div>
          </div>
        )}

        {/* Billing Address */}
        {billingAddress && (
          <div className="bg-gray-50/50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">
              Billing Address
            </h4>
            <div className="text-sm text-gray-600 space-y-1">
              {billingAddress.address1 && <p>{billingAddress.address1}</p>}
              {billingAddress.address2 && <p>{billingAddress.address2}</p>}
              <p>
                {billingAddress.city && `${billingAddress.city}, `}
                {billingAddress.region && `${billingAddress.region} `}
                {billingAddress.zip}
              </p>
              {billingAddress.country && <p>{billingAddress.country}</p>}
            </div>
          </div>
        )}
      </div>

      {/* Payment Method */}
      {order.payment_method && (
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-4">
          <CreditCard className="w-5 h-5 text-slate-600" />
          <div>
            <p className="text-sm text-gray-600">Payment Method</p>
            <p className="font-medium text-gray-800 capitalize">
              {order.payment_method}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
