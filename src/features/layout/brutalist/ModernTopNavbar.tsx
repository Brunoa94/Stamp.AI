"use client";

import Link from "next/link";
import { ShoppingBag, User, LogOut, Menu, X } from "lucide-react";
import { useUser, useLogout } from "@/hooks/useAuth";
import { useState } from "react";
import { Login } from "@/features/auth/login/Login";

export function ModernTopNavbar() {
  const { data: user } = useUser();
  const logoutMutation = useLogout();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-20 bg-concrete border-b border-ink/5 z-50 px-4 md:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 md:gap-2">
          <span className="font-anton text-2xl md:text-3xl leading-none uppercase tracking-tight text-ink">
            STAMP
          </span>
          <span className="logo-gradient-dot" />
          <span className="font-anton text-2xl md:text-3xl leading-none uppercase tracking-tight text-ink">
            AI
          </span>
        </Link>

        {/* Center CTA Button - Hidden on mobile/tablet */}
        <Link
          href="/stamp"
          className="hidden lg:block gradient-badge px-10 py-3 rounded-lg font-anton text-white text-lg uppercase tracking-widest"
        >
          STAMP IT
        </Link>

        {/* Right Side - Desktop Icons */}
        <div className="hidden lg:flex items-center gap-4">
          <Link
            href="/cart"
            className="action-btn-refined btn-glow-cyan icon-glow-cyan flex items-center border p-3.5 rounded-xl group hover:px-6"
          >
            <ShoppingBag className="w-5 h-5 text-brandCyan group-hover:scale-110 transition-transform duration-300" />
            <span className="btn-text text-xs font-bold uppercase tracking-widest text-brandCyan group-hover:text-white">
              CART
            </span>
          </Link>

          {user ? (
            <Link
              href="/profile"
              className="action-btn-refined btn-glow-purple icon-glow-purple flex items-center border p-3.5 rounded-xl group hover:px-6"
            >
              <User className="w-5 h-5 text-purple group-hover:scale-110 transition-transform duration-300" />
              <span className="btn-text text-xs font-bold uppercase tracking-widest text-purple group-hover:text-white">
                ACCOUNT
              </span>
            </Link>
          ) : (
            <Login
              variant="brutalist"
              className="action-btn-refined btn-glow-purple icon-glow-purple flex items-center border p-3.5 rounded-xl group hover:px-6"
            />
          )}

          {user && (
            <button
              onClick={handleLogout}
              className="action-btn-refined btn-glow-orange icon-glow-orange flex items-center border p-3.5 rounded-xl group hover:px-6"
            >
              <LogOut className="w-5 h-5 text-orange group-hover:scale-110 transition-transform duration-300" />
              <span className="btn-text text-xs font-bold uppercase tracking-widest text-orange group-hover:text-white">
                LOGOUT
              </span>
            </button>
          )}
        </div>

        {/* Mobile/Tablet Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-ink"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </header>

      {/* Desktop Navigation Menu - Below Header (Desktop only - lg breakpoint) */}
      <nav className="hidden lg:flex fixed top-32 right-10 z-40 flex-col gap-5 items-end">
        <Link
          href="/"
          className="nav-link-underline font-anton text-lg uppercase tracking-[0.2em] text-ink"
        >
          HOME
        </Link>
        <Link
          href="/stamp"
          className="nav-link-underline font-anton text-lg uppercase tracking-[0.2em] text-ink"
        >
          STAMP
        </Link>
        <Link
          href="/orders"
          className="nav-link-underline font-anton text-lg uppercase tracking-[0.2em] text-ink"
        >
          ORDERS
        </Link>
        <Link
          href="/dashboard"
          className="nav-link-underline font-anton text-lg uppercase tracking-[0.2em] text-ink"
        >
          DASHBOARD
        </Link>
      </nav>

      {/* Mobile/Tablet Menu Drawer */}
      <div
        className={`lg:hidden fixed top-20 left-0 right-0 bg-concrete border-b border-ink/5 z-40 transition-all duration-300 ${
          mobileMenuOpen
            ? "max-h-screen opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="flex flex-col p-6 gap-6">
          {/* Mobile Navigation Links */}
          <nav className="flex flex-col gap-4 border-b border-ink/10 pb-6">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="font-anton text-xl uppercase tracking-[0.2em] text-ink py-2"
            >
              HOME
            </Link>
            <Link
              href="/stamp"
              onClick={() => setMobileMenuOpen(false)}
              className="font-anton text-xl uppercase tracking-[0.2em] text-ink py-2"
            >
              STAMP
            </Link>
            <Link
              href="/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="font-anton text-xl uppercase tracking-[0.2em] text-ink py-2"
            >
              ORDERS
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="font-anton text-xl uppercase tracking-[0.2em] text-ink py-2"
            >
              DASHBOARD
            </Link>
          </nav>

          {/* Mobile Action Buttons */}
          <div className="flex flex-col gap-3">
            <Link
              href="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-3 border border-brandCyan/20 p-4 rounded-xl bg-brandCyan/5"
            >
              <ShoppingBag className="w-5 h-5 text-brandCyan" />
              <span className="text-sm font-bold uppercase tracking-widest text-brandCyan">
                CART
              </span>
            </Link>

            {user ? (
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-3 border border-purple/20 p-4 rounded-xl bg-purple/5"
              >
                <User className="w-5 h-5 text-purple" />
                <span className="text-sm font-bold uppercase tracking-widest text-purple">
                  ACCOUNT
                </span>
              </Link>
            ) : (
              <Login className="w-full flex items-center justify-center gap-3 border border-purple/20 p-4 rounded-xl bg-purple/5">
                <User className="w-5 h-5 text-purple" />
                <span className="text-sm font-bold uppercase tracking-widest text-purple">
                  LOGIN
                </span>
              </Login>
            )}

            {user && (
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-3 border border-orange/20 p-4 rounded-xl bg-orange/5"
              >
                <LogOut className="w-5 h-5 text-orange" />
                <span className="text-sm font-bold uppercase tracking-widest text-orange">
                  LOGOUT
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
