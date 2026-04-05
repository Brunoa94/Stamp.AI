"use client";

import Link from "next/link";

const footerStyles = {
  heading:
    "font-normal font-heading text-2xl text-slate-900 mb-8 tracking-wide",
  link: "text-slate-500 hover:text-[#7C3AED] transition-all duration-300",
  socialIcon:
    "text-slate-400 hover:text-[#7C3AED] transition-all duration-300 text-2xl",
} as const;

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-100 pt-16 pb-16">
      <div className="max-w-6xl mx-auto px-10">
        {/* Logo */}
        <div className="flex flex-col items-center justify-center mb-16">
          <span className="text-3xl font-normal font-heading tracking-widest text-slate-900 uppercase">
            Stamp.AI
          </span>
        </div>

        {/* Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          {/* Mission */}
          <div className="col-span-1">
            <h4 className={footerStyles.heading}>Our Mission</h4>
            <p className="text-slate-500 text-sm leading-loose max-w-xs font-accent italic">
              Empowering creators with AI-driven apparel design. High quality
              prints, delivered to your door with a nostalgic touch.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className={footerStyles.heading}>Platform</h4>
            <ul className="space-y-4 text-sm font-accent">
              <li>
                <Link href="/how-it-works" className={footerStyles.link}>
                  How it Works
                </Link>
              </li>
              <li>
                <Link href="/showcase" className={footerStyles.link}>
                  Showcase
                </Link>
              </li>
              <li>
                <Link href="/pricing" className={footerStyles.link}>
                  Bulk Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className={footerStyles.heading}>Company</h4>
            <ul className="space-y-4 text-sm font-accent">
              <li>
                <Link href="/about" className={footerStyles.link}>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className={footerStyles.link}>
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/careers" className={footerStyles.link}>
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className={footerStyles.heading}>Support</h4>
            <ul className="space-y-4 text-sm font-accent">
              <li>
                <Link href="/help" className={footerStyles.link}>
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/terms" className={footerStyles.link}>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className={footerStyles.link}>
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-slate-400 text-sm font-accent">
            © {currentYear} Stamp.AI Design Inc. Crafted for the Dreamers.
          </p>
          <div className="flex gap-8">
            <Link
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className={footerStyles.socialIcon}
              aria-label="Twitter"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
            </Link>
            <Link
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className={footerStyles.socialIcon}
              aria-label="Instagram"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </Link>
            <Link
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className={footerStyles.socialIcon}
              aria-label="LinkedIn"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect width="4" height="12" x="2" y="9" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
