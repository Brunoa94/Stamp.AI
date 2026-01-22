import {
  createContext,
  ReactNode,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import { CheckoutSubscriberContextState } from "./types";
import { MOCK_STATE } from "./mockState";
import { useContext } from "use-context-selector";
import { useCheckoutData } from "../../hooks/useCheckoutData";

function createCheckoutSubscriberStore(
  initialState: CheckoutSubscriberContextState,
) {
  let state = initialState;
  const listeners = new Set<() => void>();

  return {
    getState: () => state,
    setState: (newState: CheckoutSubscriberContextState) => {
      state = newState;
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export const CheckoutSubscriberContext = createContext<ReturnType<
  typeof createCheckoutSubscriberStore
> | null>(null);

interface CheckoutProviderProps {
  children: ReactNode;
  orderId: string | null;
}

export function useCheckoutSubscriberSelector<T>(
  selector: (state: CheckoutSubscriberContextState) => T,
): T {
  const store = useContext(CheckoutSubscriberContext);
  if (!store)
    throw new Error(
      "CheckoutSubscriberContext must be within CheckoutProvider",
    );
  return useSyncExternalStore(store.subscribe, () =>
    selector(store.getState()),
  );
}

export function CheckoutSubscriberProvider({
  children,
  orderId,
}: CheckoutProviderProps) {
  const [store] = useState(() => createCheckoutSubscriberStore(MOCK_STATE));
  const { isLoading, error } = useCheckoutData(orderId, store);

  useEffect(() => {
    const state = store.getState();
    const { order, customization } = state;

    // Calculate order amounts with fallbacks
    const subtotal =
      order?.subtotal || customization.price * customization.quantity;
    const shippingCost = order?.shipping_cost || 5.99;
    const discount = order?.discount_amount || 0;
    const orderAmount = subtotal + shippingCost - discount;

    // Build line items for payment
    const printAreasArray = Object.entries(customization.print_areas)
      .filter(([_position, imageId]) => imageId)
      .map(([position, imageId]) => ({
        position,
        image_id: imageId,
      }));

    const lineItems = [
      {
        product_id: customization.product_id || "",
        variant_id: customization.variant_id,
        quantity: customization.quantity,
        print_areas: printAreasArray,
        print_provider_id: customization.print_provider_id || 99,
      },
    ];

    store.setState({
      ...state,
      isLoading,
      error,
      subtotal,
      shippingCost,
      discount,
      orderAmount,
      lineItems,
    });
  }, [
    store.getState().order?.id,
    store.getState().customization,
    isLoading,
    error,
    store,
  ]);

  return (
    <CheckoutSubscriberContext.Provider value={store}>
      {children}
    </CheckoutSubscriberContext.Provider>
  );
}
