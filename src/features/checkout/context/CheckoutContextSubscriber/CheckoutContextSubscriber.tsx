"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
  useSyncExternalStore,
} from "react";
import { CheckoutSubscriberContextState } from "./types";
import { MOCK_STATE } from "./mockState";
import { useCheckoutData } from "../../hooks/useCheckoutData";
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/with-selector";
import { shallow } from "zustand/shallow";

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

      return () => {
        listeners.delete(listener);
      };
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

  return useSyncExternalStoreWithSelector(
    store.subscribe,
    store.getState,
    store.getState,
    selector,
    shallow, // prevents re-renders for equivalent objects
  );
}

export function CheckoutSubscriberProvider({
  children,
  orderId,
}: CheckoutProviderProps) {
  const [store] = useState(() => createCheckoutSubscriberStore(MOCK_STATE));
  useCheckoutData(orderId, store);

  return (
    <CheckoutSubscriberContext.Provider value={store}>
      {children}
    </CheckoutSubscriberContext.Provider>
  );
}
