import { useEffect, useRef, useState } from "react";
import { ORDERS_FILTER_LOADING_MS } from "../constants/filters";

export function useFilterLoading(deps: ReadonlyArray<unknown>) {
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    setIsFilterLoading(true);
    const timeout = setTimeout(() => {
      setIsFilterLoading(false);
    }, ORDERS_FILTER_LOADING_MS);

    return () => clearTimeout(timeout);
  }, deps);

  return isFilterLoading;
}
