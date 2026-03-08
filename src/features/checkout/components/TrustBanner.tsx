/**
 * Trust banner with security and service badges
 * Displays below order summary to build customer confidence
 */
export const TrustBanner = () => {
  return (
    <div className="glass-card p-6 rounded-none">
      <div className="flex flex-col gap-4 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
          Secured with 256-bit SSL encryption
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          <span>Secure Payment</span>
          <span>Fast Shipping</span>
          <span>Money-Back Guarantee</span>
        </div>
      </div>
    </div>
  );
};
