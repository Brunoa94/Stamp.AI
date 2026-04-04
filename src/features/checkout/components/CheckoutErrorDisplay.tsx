interface Props {
  error: string;
  onDismiss?: () => void;
}

const CheckoutErrorDisplay = ({ error, onDismiss }: Props) => {
  return (
    <div
      role="alert"
      className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start justify-between"
    >
      <div className="flex items-start gap-2">
        <svg
          className="w-5 h-5 text-red-600 mt-0.5"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
        <p className="text-sm">{error}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-700 hover:text-red-900"
          aria-label="Dismiss error"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default CheckoutErrorDisplay;
