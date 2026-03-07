# Layout Components

Shared layout components with full source code.

---

## Root Layout

- Path: `src/app/layout.tsx`
- Description: App shell with providers, navbar, footer, and main wrapper.

```tsx
import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Bungee,
  Bebas_Neue,
  Poppins,
} from "next/font/google";
import "./globals.css";

import { Toaster } from "sonner";
import { SupabaseAuthProvider } from "@/features/providers/SupabaseAuthProvider";
import { QueryProvider } from "@/features/providers/QueryProvider";
import { ThemeProvider } from "@/features/providers/ThemeProvider";
import Navbar from "@/features/layout/navbar";
import Footer from "@/features/layout/footer";
import { ScrollToTop } from "@/components/ScrollToTop";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bungee = Bungee({
  weight: "400",
  variable: "--font-bungee",
  subsets: ["latin"],
});

// Body font (Poppins for clean, modern body text)
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// Retro heading font (Bebas Neue for retro display text)
const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Imaginary Builder AI",
  description: "AI-powered design and building platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=zodiak@400,500,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bungee.variable} ${poppins.variable} ${bebasNeue.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <SupabaseAuthProvider>
            <QueryProvider>
              <ScrollToTop />
              <header>
                <Navbar />
              </header>
              <main className="pt-20 min-h-screen">{children}</main>
              <Footer />
              <Toaster />
            </QueryProvider>
          </SupabaseAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

---

## Navbar (Layout)

- Path: `src/features/layout/navbar.tsx`
- Description: Fixed top navigation with auth actions and cart.

```tsx
"use client";

import { NavbarBrand } from "./navbar/NavbarBrand";
import { NavItem } from "./navbar/NavItem";
import { StampItButton } from "./navbar/StampItButton";
import { Button } from "@/features/ui/button";
import { Package, Home, ShoppingCart, LogOut, User } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { ThemeToggle } from "@/features/ui/theme-toggle";
import { useCartSummary } from "@/queries/cartQueries";
import { useLogout, useIsAuthenticated } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { UnauthenticatedUserSection } from "./navbar/UnauthenticatedUserSection";

function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { itemCount } = useCartSummary();
  const logoutMutation = useLogout();
  const { isAuthenticated } = useIsAuthenticated();

  const handleSignOut = () => {
    logoutMutation.mutate();
  };

  const isOrdersPage = pathname === "/orders";
  const isStampPage = pathname === "/stamp";
  const isDashboardPage = pathname === "/dashboard";
  const isProfilePage = pathname === "/profile";

  return (
    <nav className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b-2 border-purple-200 dark:border-purple-700 px-4 py-4 fixed top-0 left-0 right-0 z-50 shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left - Brand */}
        <NavbarBrand />

        {/* Center - Navigation Links (only show when authenticated) */}
        {isAuthenticated && (
          <nav className="flex items-center gap-3">
            <NavItem
              label="My Orders"
              icon={Package}
              isActive={isOrdersPage}
              onClick={() => router.push("/orders")}
            />

            <StampItButton
              isActive={isStampPage}
              onClick={() => router.push("/stamp")}
            />

            <NavItem
              label="Dashboard"
              icon={Home}
              isActive={isDashboardPage}
              onClick={() => router.push("/dashboard")}
            />
          </nav>
        )}

        {/* Right - Actions */}
        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <>
              <Button
                variant="ghost"
                onClick={() => router.push("/cart")}
                className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 font-medium relative px-3 py-2"
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-linear-to-r from-purple-600 via-pink-600 to-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </Button>
              <NavItem
                label=""
                icon={User}
                onClick={() => router.push("/profile")}
                isActive={isProfilePage}
              />
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                disabled={logoutMutation.isPending}
                className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium px-3 py-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
                </span>
              </Button>
            </>
          )}
          {!isAuthenticated && (
            <>
              <ThemeToggle />
              <UnauthenticatedUserSection />
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
```

### Navbar subcomponents

#### NavbarBrand

- Path: `src/features/layout/navbar/NavbarBrand.tsx`

```tsx
import Link from "next/link";
import { Sparkles, Wand2 } from "lucide-react";
import { colors } from "@/theme";

export function NavbarBrand() {
  return (
    <div className="flex items-center">
      <Link
        href="/"
        className="group flex items-center gap-3 transition-all duration-300 hover:scale-105"
      >
        <div className="p-2 rounded-xl bg-linear-to-r from-purple-500 to-pink-500 group-hover:shadow-lg group-hover:shadow-purple-500/30 transition-all duration-300">
          <Wand2 className="w-6 h-6 text-white animate-[wiggle_0.8s_ease-in-out_infinite]" />
        </div>
        <div className="flex items-center gap-1">
          <h1
            className={`text-2xl font-bold ${colors.textGradient} transition-all duration-300`}
          >
            AI Magic Studio
          </h1>
          <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
        </div>
      </Link>
    </div>
  );
}
```

#### NavItem

- Path: `src/features/layout/navbar/NavItem.tsx`

```tsx
import { Button } from "@/features/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface NavItemProps {
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  onClick: () => void;
}

export function NavItem({
  label,
  icon: Icon,
  isActive,
  onClick,
}: NavItemProps) {
  return (
    <Button
      onClick={onClick}
      variant="ghost"
      className={cn(
        "flex items-center gap-2 font-semibold px-4 py-2",
        isActive &&
          "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300",
        !isActive &&
          "text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400",
      )}
    >
      <Icon className="w-5 h-5" />
      {label}
    </Button>
  );
}
```

#### StampItButton

- Path: `src/features/layout/navbar/StampItButton.tsx`

```tsx
import { Button } from "@/features/ui/button";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface StampItButtonProps {
  isActive: boolean;
  onClick: () => void;
}

export function StampItButton({ isActive, onClick }: StampItButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant="ghost"
      className={cn(
        "flex items-center gap-2 font-bold px-6 py-3 relative group transition-all duration-300",
        isActive &&
          "bg-linear-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl hover:shadow-purple-500/50 scale-110",
        !isActive && "hover:scale-110",
      )}
    >
      <Sparkles
        className={cn(
          "w-7 h-7 transition-transform duration-300",
          isActive
            ? "animate-pulse text-white"
            : "animate-[stamp-sparkle_2s_ease-in-out_infinite] text-purple-400 dark:text-purple-300",
        )}
      />
      <span
        className={cn(
          "text-lg font-(family-name:--font-bungee)",
          !isActive &&
            "bg-linear-to-r from-purple-400 via-pink-400 to-purple-400 dark:from-purple-300 dark:via-pink-300 dark:to-purple-300 bg-clip-text text-transparent bg-size-[200%_auto] animate-[stamp-gradient_3s_ease-in-out_infinite]",
        )}
        style={isActive ? {} : { backgroundSize: "200% auto" }}
      >
        Stamp It
      </span>
      {isActive && <Sparkles className="w-7 h-7 animate-pulse text-white" />}
    </Button>
  );
}
```

#### UnauthenticatedUserSection

- Path: `src/features/layout/navbar/UnauthenticatedUserSection.tsx`

```tsx
import { Login } from "@/features/auth/login/Login";
import { Register } from "@/features/auth/register/Register";

export function UnauthenticatedUserSection() {
  return (
    <div className="flex items-center gap-2">
      <Login />
      <Register />
    </div>
  );
}
```

#### AuthenticatedUserSection

- Path: `src/features/layout/navbar/AuthenticatedUserSection.tsx`

```tsx
import { Button } from "@/features/ui/button";
import { useLogout } from "@/hooks/useAuth";
import Link from "next/link";
import { User, LogOut, Sparkles } from "lucide-react";
import { colors } from "@/theme";
import { UserI } from "@/types/auth";

interface PropsI {
  user: UserI;
}

export function AuthenticatedUserSection({ user }: PropsI) {
  const logoutMutation = useLogout();

  const handleSignOut = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="flex items-center gap-4">
      {/* Welcome message */}
      <div className="hidden sm:flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
        <span className={`text-sm font-medium ${colors.textGradient}`}>
          Welcome, {user.user_metadata?.first_name || user.email?.split("@")[0]}
        </span>
      </div>

      {/* Dashboard button */}
      <Button
        asChild
        size="sm"
        className="bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105"
      >
        <Link href="/dashboard">
          <User className="mr-2 h-4 w-4" />
          Dashboard
        </Link>
      </Button>

      {/* Logout button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleSignOut}
        disabled={logoutMutation.isPending}
        className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-300 hover:scale-105"
      >
        <LogOut className="mr-2 h-4 w-4" />
        {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
      </Button>
    </div>
  );
}
```

---

## Footer (Layout)

- Path: `src/features/layout/footer.tsx`
- Description: App footer with links and branding.

```tsx
"use client";

import {
  Home,
  HelpCircle,
  Store,
  Package,
  ShoppingCart,
  Mail,
  Shield,
  FileText,
} from "lucide-react";
import {
  FooterBrand,
  FooterLinkSection,
  FooterConnect,
  FooterBottom,
} from "./footer/index";

const quickLinks = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/products", label: "Products", icon: Store },
  { href: "/orders", label: "My Orders", icon: Package },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
];

const supportLinks = [
  { href: "/help", label: "Help Center", icon: HelpCircle },
  { href: "/contact", label: "Contact Us", icon: Mail },
  { href: "/privacy", label: "Privacy Policy", icon: Shield },
  { href: "/terms", label: "Terms of Service", icon: FileText },
];

export function Footer() {
  return (
    <footer className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-purple-200 dark:border-purple-700 transition-all duration-300 mt-16">
      <div className="w-full px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-6 max-w-[95%] mx-auto">
          <FooterBrand />
          <FooterLinkSection
            title="Quick Links"
            icon={Home}
            links={quickLinks}
          />
          <FooterLinkSection
            title="Support"
            icon={HelpCircle}
            links={supportLinks}
          />
          <FooterConnect />
        </div>

        <FooterBottom />
      </div>
    </footer>
  );
}

export default Footer;
```

### Footer subcomponents

#### FooterBrand

- Path: `src/features/layout/footer/FooterBrand.tsx`

```tsx
import { Wand2, Sparkles } from "lucide-react";
import { colors } from "@/theme";

export function FooterBrand() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 group">
        <div className="p-1.5 rounded-lg bg-linear-to-r from-purple-500 to-pink-500 group-hover:shadow-lg group-hover:shadow-purple-500/30 transition-all duration-300">
          <Wand2 className="w-5 h-5 text-white animate-[wiggle_0.8s_ease-in-out_infinite]" />
        </div>
        <div className="flex items-center gap-1">
          <h2 className={`text-lg font-bold ${colors.textGradient}`}>
            AI Magic Studio
          </h2>
          <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
        </div>
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
        Transform your ideas into stunning designs with AI-powered creativity.
      </p>
    </div>
  );
}
```

#### FooterLinkSection

- Path: `src/features/layout/footer/FooterLinkSection.tsx`

```tsx
import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface FooterLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface Props {
  title: string;
  icon: LucideIcon;
  links: FooterLink[];
}

export function FooterLinkSection({ title, icon: Icon, links }: Props) {
  return (
    <div>
      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
        <Icon className="w-4 h-4 text-purple-500" />
        {title}
      </h3>
      <ul className="space-y-1.5">
        {links.map((link) => {
          const LinkIcon = link.icon;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-xs text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200 flex items-center gap-2 group py-1 px-2 rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                <LinkIcon className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                <span className="font-medium">{link.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
```

#### FooterConnect

- Path: `src/features/layout/footer/FooterConnect.tsx`

```tsx
import { Sparkles, Mail } from "lucide-react";

export function FooterConnect() {
  return (
    <div>
      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-purple-500" />
        Connect
      </h3>
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
        Get in touch with us
      </p>
      <div className="flex gap-2">
        <a
          href="mailto:hello@aimagicstudio.com"
          className="p-2 rounded-lg bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-800/40 dark:hover:to-pink-800/40 border border-purple-200 dark:border-purple-700 transition-all duration-200 hover:scale-110 hover:shadow-md hover:shadow-purple-500/20"
          aria-label="Email us"
        >
          <Mail className="w-4 h-4 text-gray-700 dark:text-gray-300" />
        </a>
      </div>
    </div>
  );
}
```

#### FooterBottom

- Path: `src/features/layout/footer/FooterBottom.tsx`

```tsx
import { Heart, Shield } from "lucide-react";

export function FooterBottom() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="pt-4 border-t border-purple-200 dark:border-purple-800/50 max-w-[95%] mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
          © {currentYear} AI Magic Studio. Made with
          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />
          by your AI assistant
        </p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-linear-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-200 dark:border-purple-700">
            <Shield className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
              Secure & Private
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## ScrollToTop

- Path: `src/components/ScrollToTop.tsx`
- Description: Scrolls to top on route change.

```tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
```
