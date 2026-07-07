import { Paragraph } from "@/features/ui/paragraph";
import { Heading } from "@/features/ui/heading";
import type { Address } from "@/types/order";

interface ShippingAddressCardPropsI {
  shippingAddress: Address;
  customerName?: string | null;
}

export function ShippingAddressCard({
  shippingAddress,
  customerName,
}: ShippingAddressCardPropsI) {
  return (
    <div className="border border-ink/8 bg-concrete/45 p-4">
      <Heading
        as="h4"
        variant="item"
        className="mb-2 text-[10px] tracking-[0.28em] text-ink/45"
      >
        Shipping Address
      </Heading>
      <div className="space-y-1 text-sm uppercase tracking-wide text-ink/85">
        {customerName && (
          <Paragraph as="p" className="font-medium">
            {customerName}
          </Paragraph>
        )}
        {shippingAddress.address1 && (
          <Paragraph as="p">{shippingAddress.address1}</Paragraph>
        )}
        {shippingAddress.address2 && (
          <Paragraph as="p">{shippingAddress.address2}</Paragraph>
        )}
        <Paragraph as="p">
          {shippingAddress.city && `${shippingAddress.city}, `}
          {shippingAddress.region && `${shippingAddress.region} `}
          {shippingAddress.zip}
        </Paragraph>
        {shippingAddress.country && (
          <Paragraph as="p">{shippingAddress.country}</Paragraph>
        )}
      </div>
    </div>
  );
}
