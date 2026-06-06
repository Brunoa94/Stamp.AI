/**
 * CartNotFound - Error state when cart cannot be found
 * Displays a centered message prompting the user to add items to cart
 */
export function CartNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card p-12 rounded-lg text-center max-w-md">
        <h2 className="text-3xl font-heading text-slate-900 mb-4 uppercase tracking-wider">
          Cart Not Found
        </h2>
        <p className="text-slate-600 leading-relaxed mb-6">
          We couldn't find your cart. Please try adding items to your cart
          again.
        </p>
      </div>
    </div>
  );
}
