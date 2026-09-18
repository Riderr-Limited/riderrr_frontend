"use client";

import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
  FaWhatsapp,
} from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-brand-canvas-soft text-brand-ink-secondary border-t border-brand-hairline">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Column 1: Brand */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Image
                className="h-9 w-9 rounded-lg"
                width={36}
                height={36}
                alt="Riderr logo"
                src="/logo.png"
              />
              <span className="font-bold text-xl text-brand-ink tracking-[-0.02em]">
                RIDERR
              </span>
            </div>
            <p className="text-brand-ink-muted text-sm leading-relaxed">
              Connecting customers, riders, and logistics companies on one
              platform for fast, reliable, and affordable deliveries.
            </p>

            {/* Socials */}
            <div className="flex gap-3">
              <a
                href="https://www.linkedin.com/company/riderr-logistics/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-sm text-brand-ink-secondary border border-brand-hairline hover:text-brand-primary hover:border-brand-primary/40 transition-colors"
              >
                <FaLinkedinIn />
              </a>
              <a
                href="https://www.instagram.com/riderr.ng?utm_source=qr&igsh=MTJ0Mjd4aHBlODM0ZQ=="
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-sm text-brand-ink-secondary border border-brand-hairline hover:text-brand-primary hover:border-brand-primary/40 transition-colors"
              >
                <FaInstagram />
              </a>
              <a
                href="https://wa.link/39ouwk"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-sm text-brand-ink-secondary border border-brand-hairline hover:text-brand-primary hover:border-brand-primary/40 transition-colors"
              >
                <FaWhatsapp />
              </a>
            </div>
          </div>

          {/* Column 2: For Users */}
          <div>
            <h3 className="text-sm font-bold mb-5 text-brand-ink">For Users</h3>
            <ul className="space-y-3">
              {[
                { label: "Request a Delivery", href: "#" },
                { label: "Track Deliveries", href: "#" },
                { label: "Pricing", href: "#" },
                { label: "Help Center", href: "#" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-brand-ink-muted hover:text-brand-primary transition-colors text-sm"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: For Partners */}
          <div>
            <h3 className="text-sm font-bold mb-5 text-brand-ink">For Partners</h3>
            <ul className="space-y-3">
              {[
                { label: "Become a Partner", href: "#" },
                { label: "Partner Login", href: "/login" },
                { label: "Register Riders", href: "#" },
                { label: "Dashboard", href: "/dashboard" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-brand-ink-muted hover:text-brand-primary transition-colors text-sm"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Company */}
          <div>
            <h3 className="text-sm font-bold mb-5 text-brand-ink">Company</h3>
            <ul className="space-y-3">
              {[
                { label: "About Us", href: "/about" },
                { label: "How It Works", href: "#how-it-works" },
                { label: "Contact Us", href: "#contact" },
                { label: "Privacy Policy", href: "/privacy-policy" },
                { label: "Terms & Conditions", href: "/terms-of-service" },
                { label: "Delete My Account", href: "/account-deletion" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-brand-ink-muted hover:text-brand-primary transition-colors text-sm"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Download Section */}
        <div className="border-t border-brand-hairline pt-8 pb-2">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="text-base font-bold mb-1 text-brand-ink">Download the App</h4>
              <p className="text-brand-ink-muted text-sm">
                Available on iOS and Android
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Image
                src="/app-store.svg"
                alt="Download on App Store"
                width={130}
                height={42}
                className="hover:scale-105 transition-transform cursor-pointer"
              />
              <Image
                src="/google-play.svg"
                alt="Get it on Google Play"
                width={130}
                height={42}
                className="hover:scale-105 transition-transform cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="w-full border-t border-brand-hairline text-center px-6 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-brand-ink-faint">
            © 2026 Riderr. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-brand-ink-faint">
            <Link href="/privacy-policy" className="hover:text-brand-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="hover:text-brand-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookie-policy" className="hover:text-brand-primary transition-colors">
              Cookie Policy
            </Link>
            <Link href="/account-deletion" className="hover:text-brand-primary transition-colors">
              Delete Account
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
