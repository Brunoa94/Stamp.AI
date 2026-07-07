import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.printify.com",
      },
      {
        protocol: "https",
        hostname: "images-api.printify.com",
      },
      {
        protocol: "https",
        hostname: "pfy-prod-image-storage.s3.us-east-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "oaidalleapiprodscus.blob.core.windows.net",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async headers() {
    return [
      {
        // Apply baseline security headers to every response.
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-DNS-Prefetch-Control", value: "off" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            // Also blocks framing (defense in depth with X-Frame-Options).
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "base-uri 'self'",
              "object-src 'none'",
              "frame-ancestors 'none'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              // Next.js requires inline styles/scripts; scope network egress
              // to our own origin plus the payment/backend hosts we call.
              "style-src 'self' 'unsafe-inline'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.paypal.com https://www.sandbox.paypal.com",
              "frame-src https://js.stripe.com https://hooks.stripe.com https://www.paypal.com https://www.sandbox.paypal.com",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://api.printify.com https://api-m.paypal.com https://api-m.sandbox.paypal.com https://api.mollie.com",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
