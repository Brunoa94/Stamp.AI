import { PAGE_KEYWORDS } from "../config/keywords";

export const PAGE_METADATA_CONFIGS = {
  home: {
    title: "Custom AI T-Shirt & Apparel Design",
    description:
      "Describe an idea, get a print-ready design in seconds, and put it on heavyweight clothes. No design skills needed — start for free.",
    path: "/",
    keywords: PAGE_KEYWORDS.home,
  },
  stamp: {
    title: "AI Design Studio — Create Your Print",
    description:
      "Upload a photo or describe your idea, choose a style, and let AI make print-ready designs. Adjust the product and order in minutes.",
    path: "/stamp",
    keywords: PAGE_KEYWORDS.stamp,
  },
  cart: {
    title: "Shopping Cart",
    description:
      "Review your custom AI-designed apparel before checkout. Free shipping on orders over $75.",
    path: "/cart",
    keywords: PAGE_KEYWORDS.cart,
    noindex: true,
  },
  checkout: {
    title: "Secure Checkout",
    description:
      "Complete your order for custom AI-designed apparel. Secure payment with Stripe and PayPal.",
    path: "/checkout",
    keywords: PAGE_KEYWORDS.checkout,
    noindex: true,
  },
  orders: {
    title: "My Orders",
    description:
      "Track your custom apparel orders and view order history. Real-time shipping updates.",
    path: "/orders",
    keywords: PAGE_KEYWORDS.orders,
    noindex: true,
  },
  dashboard: {
    title: "Design Dashboard",
    description:
      "View your saved designs, order history, and create new custom apparel with AI.",
    path: "/dashboard",
    keywords: PAGE_KEYWORDS.dashboard,
    noindex: true,
  },
  profile: {
    title: "My Profile",
    description:
      "Manage your account settings, shipping addresses, and preferences.",
    path: "/profile",
    keywords: PAGE_KEYWORDS.profile,
    noindex: true,
  },
  resetPassword: {
    title: "Reset Password",
    description: "Reset your Stamp AI account password securely.",
    path: "/reset-password",
    noindex: true,
  },
  notFound: {
    title: "Page Not Found",
    description:
      "The page you're looking for doesn't exist. Return to create custom AI-designed apparel.",
    path: "/404",
    noindex: true,
  },
} as const;
