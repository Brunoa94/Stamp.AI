"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
} from "react";
import { CreateProductContextState } from "./types";
import { MOCK_STATE } from "./mockState";
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/with-selector";
import { shallow } from "zustand/shallow";
import { useImageGenerationForm } from "../../ProductCreateForm/hooks/useImageGenerationForm";

function createCreateProductSubscriberStore(
  initialState: CreateProductContextState,
) {
  let state = initialState;
  const listeners = new Set<() => void>();

  return {
    getState: () => state,
    setState: (newState: CreateProductContextState) => {
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

export const CreateProductSubscriberContext = createContext<ReturnType<
  typeof createCreateProductSubscriberStore
> | null>(null);

interface CreateProductProviderProps {
  children: ReactNode;
}

export function useCreateProductSubscriberSelector<T>(
  selector: (state: CreateProductContextState) => T,
): T {
  const store = useContext(CreateProductSubscriberContext);

  if (!store)
    throw new Error(
      "CreateProductSubscriberContext must be within CreateProductSubscriberProvider",
    );

  return useSyncExternalStoreWithSelector(
    store.subscribe,
    store.getState,
    store.getState,
    selector,
    shallow, // prevents re-renders for equivalent objects
  );
}

export function CreateProductSubscriberProvider({
  children,
}: CreateProductProviderProps) {
  const [store] = useState(() =>
    createCreateProductSubscriberStore(MOCK_STATE),
  );

  // Initialize form
  const { form } = useImageGenerationForm();

  // Set form in store on mount
  useEffect(() => {
    const currentState = store.getState();
    if (!currentState.form) {
      store.setState({ ...currentState, form });
    }
  }, [form, store]);

  // Watch form values and sync to context
  useEffect(() => {
    const subscription = form.watch((value) => {
      const currentState = store.getState();
      store.setState({
        ...currentState,
        uploadedImage: value.image || null,
        prompt: value.prompt || "",
      });
    });

    return () => subscription.unsubscribe();
  }, [form, store]);

  return (
    <CreateProductSubscriberContext.Provider value={store}>
      {children}
    </CreateProductSubscriberContext.Provider>
  );
}
