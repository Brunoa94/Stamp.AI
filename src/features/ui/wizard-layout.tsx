import { ReactNode } from "react";

interface WizardLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
  className?: string;
}

export function WizardLayout({
  sidebar,
  children,
  className,
}: WizardLayoutProps) {
  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row min-h-175 shadow-lg rounded-2xl overflow-hidden">
      {/* Left Sidebar */}
      {sidebar}

      {/* Right Content Panel */}
      <section className="flex-1 flex flex-col bg-white relative">
        {children}
      </section>
    </div>
  );
}
