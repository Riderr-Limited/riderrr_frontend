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
    <footer className="w-full bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Partners Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Our Trusted Partners
          </h2>
          <p className="text-gray-300 mb-8 text-lg max-w-3xl mx-auto">
            We work with verified logistics companies to deliver fast,
            affordable, and reliable services—connecting users with nearby
            riders while enabling partners to manage operations in real time.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap md:justify-center items-center gap-4 md:gap-10">
            {[1, 2, 3, 4, 5].map((num) => (
              <div
                key={num}
                className="bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-700 hover:bg-gray-700 transition-all duration-300"
              >
                <Image
                  src="/partner-logo-placeholder.svg"
                  alt={`Partner ${num}`}
                  width={100}
                  height={40}
                  className="opacity-80 w-full h-auto"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Main Footer Grid - Mobile: 2 columns, Desktop: 4 columns */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Brand */}
          <div className="col-span-2 lg:col-span-1 space-y-6">
            <h3 className="text-xl font-bold">About the Platform</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              An on-demand delivery platform that matches users with nearby
              riders at efficient costs, while empowering logistics partners
              with smart rider and delivery management tools.
            </p>

            {/* Socials */}
            <div className="flex gap-4">
              <a
                href="https://www.linkedin.com/company/riderr-logistics/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-lg hover:bg-blue-500 transition-all border border-gray-700"
              >
                <FaLinkedinIn />
              </a>
              <a
                href="https://www.instagram.com/riderr.ng?utm_source=qr&igsh=MTJ0Mjd4aHBlODM0ZQ=="
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-lg hover:bg-blue-500 transition-all border border-gray-700"
              >
                <FaInstagram />
              </a>
              <a
                href="https://wa.link/39ouwk"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-lg hover:bg-blue-500 transition-all border border-gray-700"
              >
                <FaWhatsapp />
              </a>
            </div>
          </div>

          {/* Column 2: For Users */}
          <div>
            <h3 className="text-lg font-semibold mb-4">For Users</h3>
            <ul className="space-y-2">
              {[
                "Request a Delivery",
                "Track Deliveries",
                "Pricing",
                "Help Center",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: For Partners */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">For Partners</h3>
            <ul className="space-y-2">
              {[
                "Become a Partner",
                "Partner Login",
                "Register Riders",
                "Dashboard",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Company */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
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
                    className="text-gray-300 hover:text-white transition-colors text-sm"
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
      <div className="w-full bg-gray-800 border-t border-gray-700 text-center px-6 py-4">
        <p className="text-sm text-gray-400">© 2026 Riderr. All rights reserved.</p>
      </div>
    </footer>
  );
}
