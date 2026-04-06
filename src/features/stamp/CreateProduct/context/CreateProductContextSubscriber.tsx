"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
} from "react";
import { NavigationState, FormState } from "./types";
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/with-selector";
import { shallow } from "zustand/shallow";
import { useImageGenerationForm } from "../hooks/useImageGenerationForm";

// ---------------------------------------------------------------------------
// Generic external store factory
// ---------------------------------------------------------------------------

function createStore<T>(initialState: T) {
  let state = initialState;
  const listeners = new Set<() => void>();

  return {
    getState: () => state,
    setState: (newState: T) => {
      state = newState;
      listeners.forEach((l) => l());
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

type Store<T> = ReturnType<typeof createStore<T>>;

// ---------------------------------------------------------------------------
// Initial states
// ---------------------------------------------------------------------------

const INITIAL_NAVIGATION: NavigationState = {
  currentStep: "upload",
  completedSteps: [],
};

const INITIAL_FORM: FormState = {
  form: null,
  uploadedImage: null,
  prompt: "",
  showPromptCustomization: false,
  preservation: 80,
  selectedStyle: "na",
  isGenerating: false,
  generatedResult: null,
  generationError: null,
  selectedTshirt: null,
  selectedColor: null,
  selectedSize: null,
  isCreatingProduct: false,
  createdProduct: null,
};

// ---------------------------------------------------------------------------
// Contexts
// Two separate React contexts so components subscribe only to the slice they
// actually need, preventing cross-slice re-renders.
// ---------------------------------------------------------------------------

/**
 * NavigationSubscriberContext — holds step / completion state only.
 * Subscribers (sidebar, mobile nav) are NOT notified by form keystrokes.
 */
export const NavigationSubscriberContext =
  createContext<Store<NavigationState> | null>(null);

/**
 * FormSubscriberContext — holds form inputs + async operation state.
 * Subscribers are notified on every prompt keystroke and async event.
 */
export const FormSubscriberContext = createContext<Store<FormState> | null>(
  null,
);

// ---------------------------------------------------------------------------
// Selector hooks
// ---------------------------------------------------------------------------

/**
 * Subscribe to a slice of NavigationState.
 * The `shallow` equality check prevents re-renders when the selected value
 * has not changed even though the store was updated.
 */
export function useNavigationSelector<T>(
  selector: (state: NavigationState) => T,
): T {
  const store = useContext(NavigationSubscriberContext);
  if (!store)
    throw new Error(
      "useNavigationSelector must be used within CreateProductSubscriberProvider",
    );
  return useSyncExternalStoreWithSelector(
    store.subscribe,
    store.getState,
    store.getState,
    selector,
    shallow,
  );
}

/**
 * Subscribe to a slice of FormState.
 * Uses `shallow` equality to bail out of re-renders when the selected value
 * is structurally identical to the previous one.
 */
export function useFormSelector<T>(selector: (state: FormState) => T): T {
  const store = useContext(FormSubscriberContext);
  if (!store)
    throw new Error(
      "useFormSelector must be used within CreateProductSubscriberProvider",
    );
  return useSyncExternalStoreWithSelector(
    store.subscribe,
    store.getState,
    store.getState,
    selector,
    shallow,
  );
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface CreateProductProviderProps {
  children: ReactNode;
}

export function CreateProductSubscriberProvider({
  children,
}: CreateProductProviderProps) {
  // Each store is created once and its reference never changes — stable context values.
  const [navigationStore] = useState(() => createStore(INITIAL_NAVIGATION));
  const [formStore] = useState(() => createStore(INITIAL_FORM));

  const { form } = useImageGenerationForm();

  // Inject the RHF form instance into the store on mount
  useEffect(() => {
    const current = formStore.getState();
    if (!current.form) {
      formStore.setState({ ...current, form });
    }
  }, [form, formStore]);

  // Keep uploadedImage and prompt in sync with RHF field values.
  // Only the FormStore is updated here — NavigationStore subscribers are silent.
  useEffect(() => {
    const subscription = form.watch((value) => {
      const current = formStore.getState();
      formStore.setState({
        ...current,
        uploadedImage: value.image || null,
        prompt: value.prompt || "",
      });
    });
    return () => subscription.unsubscribe();
  }, [form, formStore]);

  return (
    <NavigationSubscriberContext.Provider value={navigationStore}>
      <FormSubscriberContext.Provider value={formStore}>
        {children}
      </FormSubscriberContext.Provider>
    </NavigationSubscriberContext.Provider>
  );
}
