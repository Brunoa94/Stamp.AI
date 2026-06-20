"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Upload,
  Zap,
  Sparkles,
  Eye,
  ShoppingBag,
  Settings,
  CheckCircle,
  HelpCircle,
} from "lucide-react";

interface SidebarStepI {
  number: number;
  icon: React.ElementType;
  label: string;
  color: "purple" | "cyan" | "orange";
  href?: string;
  animate?: boolean;
}

const SIDEBAR_STEPS: SidebarStepI[] = [
  {
    number: 1,
    icon: Upload,
    label: "01 Upload Protocol",
    color: "purple",
    href: "/stamp?step=upload",
  },
  {
    number: 2,
    icon: Zap,
    label: "02 Synthesis Input",
    color: "cyan",
    href: "/stamp?step=synthesis",
    animate: true,
  },
  {
    number: 3,
    icon: Sparkles,
    label: "03 Neural Process",
    color: "orange",
    href: "/stamp?step=generation",
  },
  {
    number: 4,
    icon: Eye,
    label: "04 Visual Result",
    color: "purple",
    href: "/stamp?step=results",
  },
  {
    number: 5,
    icon: ShoppingBag,
    label: "05 Product Spec",
    color: "cyan",
    href: "/stamp?step=product",
  },
  {
    number: 6,
    icon: Settings,
    label: "06 Fabric Configuration",
    color: "orange",
    href: "/stamp?step=fabric",
    animate: true,
  },
  {
    number: 7,
    icon: CheckCircle,
    label: "07 Archival Confirm",
    color: "purple",
    href: "/stamp?step=confirm",
  },
];

const getIconColor = (color: SidebarStepI["color"]) => {
  switch (color) {
    case "purple":
      return "text-brandPurple";
    case "cyan":
      return "text-brandCyan";
    case "orange":
      return "text-brandOrange";
    default:
      return "text-ink";
  }
};

export function ProtocolSidebar() {
  const [activeStep, setActiveStep] = useState(2); // Default: Synthesis

  const progressPercentage = (activeStep / SIDEBAR_STEPS.length) * 100;

  return (
    <aside className="fixed top-20 left-0 w-20 h-[calc(100vh-80px)] bg-white/2 border-r border-ink/5 z-40 hidden lg:flex flex-col items-center py-12">
      <div className="relative h-full flex flex-col items-center justify-between">
        {/* Vertical Progress Tracking Line */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-ink/5">
          <div
            className="w-full bg-gradient-to-b from-brandPurple via-brandCyan to-brandOrange transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[0_0_10px_rgba(6,182,212,0.5)]"
            style={{ height: `${progressPercentage}%` }}
          />
        </div>

        {/* Step Icons */}
        <div className="flex flex-col gap-10 items-center h-full relative z-10">
          {SIDEBAR_STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = activeStep === step.number;

            return (
              <Link
                key={step.number}
                href={step.href || "#"}
                onClick={() => setActiveStep(step.number)}
                className={`
                  group relative w-12 h-12 rounded-full bg-white border flex items-center justify-center
                  transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)]
                  ${
                    isActive
                      ? "border-brandCyan shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-[1.15]"
                      : "border-ink/5 hover:scale-110 hover:shadow-[0_0_15px_rgba(10,10,10,0.1)]"
                  }
                `}
              >
                <Icon
                  className={`
                    w-5 h-5 transition-transform group-hover:scale-110
                    ${getIconColor(step.color)}
                    ${isActive && step.animate ? "animate-pulse" : ""}
                    ${!isActive && step.animate ? "animate-spin-slow" : ""}
                  `}
                />

                {/* Tooltip */}
                <span
                  className={`
                    absolute left-full ml-5 px-3 py-1.5
                    bg-ink text-white text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap
                    opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:ml-4
                    transition-all duration-300 pointer-events-none
                  `}
                >
                  {step.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Help Icon at Bottom */}
        <button
          className="mt-auto text-ink/10 hover:text-ink/50 transition-colors"
          aria-label="Help"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
}
