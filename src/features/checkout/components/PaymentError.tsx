import { Button } from "@/features/ui/button";
import { XCircle } from "lucide-react";

interface Props {
  message: string;
  onTryAgain: () => void;
}

const PaymentError = ({ message, onTryAgain }: Props) => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <article className="w-full max-w-md glass-card rounded-3xl p-10 text-center">
        <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <XCircle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-heading font-bold uppercase tracking-tight text-slate-900 mb-3">
          Payment Failed
        </h2>
        <p className="text-slate-600 mb-8">{message}</p>
        <Button
          variant="destructive"
          onClick={onTryAgain}
          className="w-full py-4 font-heading uppercase tracking-widest"
        >
          Try Again
        </Button>
      </article>
    </div>
  );
};

export default PaymentError;
