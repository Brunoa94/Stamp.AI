"use client";

import Link from "next/link";
import { Button } from "@/features/ui/button";
import clsx from "clsx";

interface NavbarProps {
  activeItem?: "orders" | "stamp" | "dashboard";
  onToggleTheme?: () => void;
  onViewProfile?: () => void;
  onSignOut?: () => void;
}

const navStyles = {
  link: "px-5 py-2 text-sm font-heading tracking-widest rounded transition-all duration-300",
  active: "text-slate-900 bg-slate-50",
  inactive: "text-slate-500 hover:text-slate-900 hover:bg-slate-50",
  iconButton:
    "w-10 h-10 flex items-center justify-center text-slate-400 hover:text-[#7C3AED] hover:bg-[#F3ECFF] rounded-md transition-all duration-300",
} as const;

export function Navbar({
  activeItem = "stamp",
  onToggleTheme,
  onViewProfile,
  onSignOut,
}: NavbarProps) {
  return (
    <nav className="bg-white border-b border-[#E8E0F0] sticky top-0 z-50">
      <div className="max-w-360 mx-auto px-6">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group cursor-pointer"
          >
            <span className="text-2xl font-normal font-heading tracking-widest text-slate-900 uppercase">
              Stamp.AI
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/orders"
              className={clsx(
                navStyles.link,
                activeItem === "orders" ? navStyles.active : navStyles.inactive,
              )}
            >
              My Orders
            </Link>

            <Link
              href="/dashboard/create-product"
              className="px-6 py-2.5 text-base font-heading tracking-widest text-white bg-[#7C3AED] rounded shadow-[0_4px_14px_rgba(124,58,237,0.3)] transition-all duration-300 hover:bg-[#6D28D9] hover:shadow-[0_6px_20px_rgba(124,58,237,0.4)] hover:-translate-y-0.5"
            >
              Stamp It!
            </Link>

            <Link
              href="/dashboard"
              className={clsx(
                navStyles.link,
                activeItem === "dashboard"
                  ? navStyles.active
                  : navStyles.inactive,
              )}
            >
              Dashboard
            </Link>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleTheme}
              className={navStyles.iconButton}
              aria-label="Toggle theme"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            </button>

            <div className="h-6 w-px bg-slate-200" />

            <button
              onClick={onViewProfile}
              className="flex items-center gap-2 pl-2 group"
              aria-label="View profile"
            >
              <div className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-[#F3ECFF] group-hover:text-[#7C3AED] transition-all duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            </button>

            <Button
              onClick={onSignOut}
              className="ml-2 px-5 py-2 text-sm font-heading tracking-widest text-white bg-[#FF4444] rounded transition-all duration-300 hover:bg-[#E03333] hover:shadow-[0_4px_14px_rgba(255,68,68,0.3)] hover:-translate-y-0.5"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
