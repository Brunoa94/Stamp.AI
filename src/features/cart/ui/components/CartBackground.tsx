/**
 * Cart Background Component
 *
 * Provides the animated background effects for the cart page:
 * - Fixed grain overlay texture
 * - Rotating conic gradient layer
 * - Floating blur blobs with animations
 */

export function CartBackground() {
  return (
    <>
      {/* Grain overlay texture */}
      <div className="grain-overlay" />

      {/* Animated background layers */}
      <div className="section-bg-overlay">
        {/* Rotating gradient */}
        <div className="gradient-layer" />

        {/* Floating blobs */}
        <div
          className="blob w-[60vw] h-[60vw] bg-brandPurple/20 -top-20 -left-20"
          style={{ animation: 'floatBlob 20s ease-in-out infinite' }}
        />
        <div
          className="blob w-[50vw] h-[50vw] bg-brandCyan/10 bottom-10 right-10"
          style={{ animation: 'floatBlob 20s ease-in-out infinite', animationDelay: '-5s' }}
        />
      </div>
    </>
  );
}
