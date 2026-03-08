import { CheckoutSelectors } from "../context/CheckoutContextSubscriber/selectors";
import { Button } from "@/features/ui/button";
import { componentThemes } from "@/theme/components";

const MOCK_SHIPPING_ADDRESS = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  country: "US",
  region: "",
  address1: "",
  address2: "",
  city: "",
  zip: "",
};

const shippingAddressStyles =
  componentThemes.checkout.orderSummary.shippingAddress;

interface ShippingAddressProps {
  onEditShipping: () => void;
}

export const ShippingAddress = ({ onEditShipping }: ShippingAddressProps) => {
  const shippingAddress =
    CheckoutSelectors.shippingAddress() || MOCK_SHIPPING_ADDRESS;
  const hasShippingAddress = shippingAddress?.address1 && shippingAddress.city;

  if (!hasShippingAddress) {
    return null;
  }

  return (
    <section className={shippingAddressStyles.container}>
      <header className={shippingAddressStyles.header}>
        <h3 className={shippingAddressStyles.heading}>Shipping To</h3>
        <Button
          variant="link"
          onClick={onEditShipping}
          className={shippingAddressStyles.editButton}
        >
          Edit
        </Button>
      </header>

      <address className={shippingAddressStyles.address}>
        <p className={shippingAddressStyles.recipientName}>
          {shippingAddress.first_name} {shippingAddress.last_name}
        </p>
        <p className={shippingAddressStyles.addressLine}>
          {shippingAddress.address1}
        </p>
        {shippingAddress.address2 && (
          <p className={shippingAddressStyles.addressLine}>
            {shippingAddress.address2}
          </p>
        )}
        <p className={shippingAddressStyles.addressLine}>
          {shippingAddress.city}
          {shippingAddress.region && `, ${shippingAddress.region}`}{" "}
          {shippingAddress.zip}
        </p>
        <p className={shippingAddressStyles.addressLine}>
          {shippingAddress.email}
        </p>
      </address>
    </section>
  );
};
