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
    <footer className="w-full bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Column 1: Brand */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#1E5FD8] to-[#1a4fb8] flex items-center justify-center shadow-lg">
                <Image
                  className="rounded-lg"
                  width={24}
                  height={24}
                  alt="logo"
                  src="/favicon.ico"
                />
              </div>
              <span className="font-bold text-2xl text-white tracking-tight">
                RIDERR
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Connecting customers, riders, and logistics companies on one
              platform for fast, reliable, and affordable deliveries.
            </p>

            {/* Socials */}
            <div className="flex gap-3">
              <a
                href="https://www.linkedin.com/company/riderr-logistics/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-base hover:bg-[#1E5FD8] transition-all border border-gray-700 hover:border-[#1E5FD8]"
              >
                <FaLinkedinIn />
              </a>
              <a
                href="https://www.instagram.com/riderr.ng?utm_source=qr&igsh=MTJ0Mjd4aHBlODM0ZQ=="
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-base hover:bg-[#1E5FD8] transition-all border border-gray-700 hover:border-[#1E5FD8]"
              >
                <FaInstagram />
              </a>
              <a
                href="https://wa.link/39ouwk"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-base hover:bg-[#1E5FD8] transition-all border border-gray-700 hover:border-[#1E5FD8]"
              >
                <FaWhatsapp />
              </a>
            </div>
          </div>

          {/* Column 2: For Users */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">For Users</h3>
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
                    className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-[#1E5FD8] transition-colors" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: For Partners */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">For Partners</h3>
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
                    className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-[#1E5FD8] transition-colors" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Company */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Company</h3>
            <ul className="space-y-3">
              {[
                { label: "About Us", href: "/about" },
                { label: "How It Works", href: "#how-it-works" },
                { label: "Contact Us", href: "#contact" },
                { label: "Privacy Policy", href: "/privacy-policy" },
                { label: "Terms & Conditions", href: "/terms-of-service" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-[#1E5FD8] transition-colors" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Download Section */}
        <div className="border-t border-gray-800 pt-8 pb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="text-lg font-bold mb-2">Download the App</h4>
              <p className="text-gray-400 text-sm">
                Available on iOS and Android
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Image
                src="/app-store.svg"
                alt="Download on App Store"
                width={140}
                height={45}
                className="hover:scale-105 transition-transform cursor-pointer"
              />
              <Image
                src="/google-play.svg"
                alt="Get it on Google Play"
                width={140}
                height={45}
                className="hover:scale-105 transition-transform cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="w-full bg-gray-950 border-t border-gray-800 text-center px-6 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            © 2026 Riderr. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookie-policy" className="hover:text-white transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
