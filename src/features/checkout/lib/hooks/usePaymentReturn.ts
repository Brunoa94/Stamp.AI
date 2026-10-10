import { useEffect, useRef, useState } from "react";
import type {
  PaymentReturnStateI,
  PaymentReturnUpdateT,
} from "../types/paymentReturn";
import { useUser } from "@/shared/queries/authQueries";
import type { UserI } from "@/supabase/types";

type ProcessReturnT<TState extends PaymentReturnStateI> = (
  user: UserI | null,
  update: PaymentReturnUpdateT<TState>,
) => Promise<void>;

/**
 * Runs a payment return processor exactly once, after the user has
 * loaded, and exposes the state the processor reports.
 */
export function usePaymentReturn<TState extends PaymentReturnStateI>(
  initialState: TState,
  processReturn: ProcessReturnT<TState>,
): TState {
  const { data: user, isLoading: isUserLoading } = useUser();
  const [state, setState] = useState<TState>(initialState);
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (isUserLoading || hasProcessed.current) return;
    hasProcessed.current = true;

    const update: PaymentReturnUpdateT<TState> = (patch) =>
      setState((previous) => ({ ...previous, ...patch }));

    void processReturn(user ?? null, update);
  }, [isUserLoading, user, processReturn]);

  return state;
}
