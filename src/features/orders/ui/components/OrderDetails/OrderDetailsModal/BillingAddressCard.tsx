import { Paragraph } from "@/features/ui/paragraph";
import { Heading } from "@/features/ui/heading";
import type { Address } from "@/types/order";

interface BillingAddressCardPropsI {
  billingAddress: Address;
}

export function BillingAddressCard({
  billingAddress,
}: BillingAddressCardPropsI) {
  return (
    <div className="border border-ink/8 bg-white p-4">
      <Heading
        as="h4"
        variant="item"
        className="mb-2 text-[10px] tracking-[0.28em] text-ink/45"
      >
        Billing Address
      </Heading>
      <div className="space-y-1 text-sm uppercase tracking-wide text-ink/85">
        {billingAddress.address1 && (
          <Paragraph as="p">{billingAddress.address1}</Paragraph>
        )}
        {billingAddress.address2 && (
          <Paragraph as="p">{billingAddress.address2}</Paragraph>
        )}
        <Paragraph as="p">
          {billingAddress.city && `${billingAddress.city}, `}
          {billingAddress.region && `${billingAddress.region} `}
          {billingAddress.zip}
        </Paragraph>
        {billingAddress.country && (
          <Paragraph as="p">{billingAddress.country}</Paragraph>
        )}
      </div>
    </div>
  );
}
