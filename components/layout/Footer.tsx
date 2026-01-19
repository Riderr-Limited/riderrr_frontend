"use client";

import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
  FaWhatsapp,
} from "react-icons/fa";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="w-full bg-linear-to-br bg-[#1E5FD8] text-white relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 md:px-12 lg:px-20 py-16 relative z-10">
        {/* Partners Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Our Trusted Partners
          </h2>
          <p className="text-blue-100 mb-8 text-lg max-w-3xl mx-auto">
            We work with verified logistics companies to deliver fast,
            affordable, and reliable services—connecting users with nearby
            riders while enabling partners to manage operations in real time.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
            {[1, 2, 3, 4, 5].map((num) => (
              <div
                key={num}
                className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <Image
                  src="/partner-logo-placeholder.svg"
                  alt={`Partner ${num}`}
                  width={120}
                  height={50}
                  className="opacity-80"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Column 1: Brand */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold">About the Platform</h3>
            <p className="text-blue-100 text-sm leading-relaxed">
              An on-demand delivery platform that matches users with nearby
              riders at efficient costs, while empowering logistics partners
              with smart rider and delivery management tools.
            </p>

            {/* Socials */}
            <div className="flex gap-4">
              {[FaLinkedinIn, FaInstagram, FaWhatsapp].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-11 h-11 bg-white/10 rounded-full flex items-center justify-center text-lg hover:bg-white/20 transition-all border border-white/20"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: For Users */}
          <div>
            <h3 className="text-xl font-bold mb-6">For Users</h3>
            <ul className="space-y-3">
              {[
                "Request a Delivery",
                "Track Deliveries",
                "Pricing",
                "Help Center",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-blue-100 hover:text-white transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: For Partners */}
          <div>
            <h3 className="text-xl font-bold mb-6">For Logistics Partners</h3>
            <ul className="space-y-3">
              {[
                "Become a Partner",
                "Partner Login",
                "Register Riders",
                "Dashboard",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-blue-100 hover:text-white transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Company */}
          <div>
            <h3 className="text-xl font-bold mb-6">Company</h3>
            <ul className="space-y-3">
              {[
                "About Us",
                "How It Works",
                "Contact Us",
                "Privacy Policy",
                "Terms & Conditions",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-blue-100 hover:text-white transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="w-full bg-brand-900/50 border-t border-white/10 text-center px-6 md:px-12 lg:px-20 py-6 text-sm text-blue-200">
        <p>© 2026 Riderr. All rights reserved.</p>
      </div>
    </footer>
  );
}
