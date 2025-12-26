"use client";

import Image from "next/image";
import Link from "next/link";

export default function CallToAction() {
  return (
    <section className="relative w-full overflow-hidden bg-linear-to-br from-brand-700 via-brand-800 to-brand-900 text-white">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-6 md:px-12 lg:px-20 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Deliver Faster. Earn More. Scale Smarter.
            </h2>

            <p className="text-blue-100 text-lg max-w-xl">
              Request deliveries in seconds, connect with nearby riders at the
              best cost, or partner with us to manage riders and deliveries
              efficiently—all in one powerful platform.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="#download"
                className="px-7 py-4 bg-white text-brand-900 font-semibold rounded-xl hover:bg-blue-50 transition"
              >
                Download the App
              </Link>

              <Link
                href="#partners"
                className="px-7 py-4 bg-white/10 border border-white/20 rounded-xl font-semibold hover:bg-white/20 transition"
              >
                Become a Partner
              </Link>

              <Link
                href="#get-started"
                className="px-7 py-4 bg-transparent underline underline-offset-4 text-blue-100 hover:text-white transition"
              >
                Get Started
              </Link>
            </div>

            {/* App Store Badges */}
            <div className="flex items-center gap-4 pt-6">
              <Image
                src="/appstore.svg"
                alt="Download on App Store"
                width={150}
                height={50}
              />
              <Image
                src="/playstore.svg"
                alt="Get it on Google Play"
                width={150}
                height={50}
              />
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative flex justify-center">
            <div className="bg-white/10 border border-white/20 backdrop-blur-lg rounded-3xl p-6 shadow-xl">
              <Image
                src="/app-mockup.png"
                alt="Delivery App Preview"
                width={360}
                height={720}
                className="rounded-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
