interface PropsI {
  message: string;
}

/** Inline card payment error shown above the pay button. */
export function CreditPaymentErrorMessage({ message }: PropsI) {
  return (
    <div className="rounded-lg border border-(--color-stamp-error)/20 bg-(--color-stamp-error)/5 p-3 text-sm text-(--color-stamp-error)">
      {message}
    </div>
  );
}
