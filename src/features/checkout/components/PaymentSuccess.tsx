import { Button } from "@/features/ui/button";

interface Props {
  message: string;
  onCreateAnother: () => void;
}

const PaymentSuccess = ({ message, onCreateAnother }: Props) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <article className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <div className="mb-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Payment Successful!
          </h2>
          <p className="text-gray-600 mb-4">{message}</p>
          <p className="text-sm text-gray-500">
            Your order is being processed and will be sent to Printify for
            production.
          </p>
          <Button
            onClick={onCreateAnother}
            className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Create Another Order
          </Button>
        </div>
      </article>
    </div>
  );
};

export default PaymentSuccess;
