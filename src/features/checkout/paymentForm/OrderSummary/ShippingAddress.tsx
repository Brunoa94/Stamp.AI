import { CheckoutSelectors } from "../../context/CheckoutContextSubscriber/selectors";

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
    <div className="pt-6 pb-6 border-b border-purple-100">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-900">Shipping To</h3>
        <button
          onClick={onEditShipping}
          className="text-sm text-purple-600 hover:text-purple-700 font-medium"
        >
          Edit
        </button>
      </div>
      <address className="text-sm text-gray-600 not-italic space-y-1">
        <p className="font-medium text-gray-900">
          {shippingAddress.first_name} {shippingAddress.last_name}
        </p>
        <p>{shippingAddress.address1}</p>
        {shippingAddress.address2 && <p>{shippingAddress.address2}</p>}
        <p>
          {shippingAddress.city}
          {shippingAddress.region && `, ${shippingAddress.region}`}{" "}
          {shippingAddress.zip}
        </p>
        <p>{shippingAddress.email}</p>
      </address>
    </div>
  );
};
