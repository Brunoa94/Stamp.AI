import type { ReactNode } from "react";

interface PropsI {
  children: ReactNode;
}

/** Full-width stacked call-to-action buttons below a payment result. */
export function PaymentResultActions({ children }: PropsI) {
  return <div className="flex flex-col gap-4">{children}</div>;
}
