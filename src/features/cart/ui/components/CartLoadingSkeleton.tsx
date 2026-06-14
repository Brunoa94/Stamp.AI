export function CartLoadingSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading cart"
      className="flex items-center justify-center min-h-75"
    >
      <div
        className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"
        aria-hidden="true"
      />
    </div>
  );
}
