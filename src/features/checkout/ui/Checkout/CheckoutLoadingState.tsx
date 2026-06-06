interface Props {
  message?: string;
}

const CheckoutLoadingState = ({ message = "Creating your custom product" }: Props) => {
  return (
    <section
      className="bg-white rounded-lg shadow-md p-12 text-center"
      role="status"
      aria-live="polite"
    >
      <div
        className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4 border-4 border-gray-200 border-t-blue-600 rounded-full"
        aria-hidden="true"
      />
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{message}</h2>
      <p className="text-gray-600">
        Applying your design to the product... This may take a moment.
      </p>
      <span className="sr-only">Loading...</span>
    </section>
  );
};

export default CheckoutLoadingState;
