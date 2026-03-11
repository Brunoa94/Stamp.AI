import { Button } from "@/features/ui/button";
import { CheckCircle } from "lucide-react";

interface Props {
  message: string;
  onCreateAnother: () => void;
}

const PaymentSuccess = ({ message, onCreateAnother }: Props) => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <article className="w-full max-w-md glass-card rounded-3xl p-10 text-center">
        <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-heading font-bold uppercase tracking-tight text-slate-900 mb-3">
          Payment Successful!
        </h2>
        <p className="text-slate-600 mb-2">{message}</p>
        <p className="text-sm text-slate-500 mb-8">
          Your order is being processed and will be sent to production.
        </p>
        <Button
          onClick={onCreateAnother}
          className="w-full py-4 font-heading uppercase tracking-widest bg-linear-to-br from-[#7C3AED] to-[#06B6D4] shadow-lg shadow-purple-500/30"
        >
          Create Another Order
        </Button>
      </article>
    </div>
  );
};

export default PaymentSuccess;
