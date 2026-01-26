"use client";

import Image from "next/image";
import Link from "next/link";

export default function CallToAction() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#337BFF] via-[#4A90E2] to-[#2563EB] min-h-screen">
      {/* Decorative Background */}
      <div className="absolute inset-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
      </div>

      <div className="relative z-10 container mx-auto px-6 md:px-12 lg:px-20 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white drop-shadow-lg">
              Deliver Faster. <span className="text-yellow-300">Earn More.</span> Scale Smarter.
            </h2>

            <p className="text-white/90 text-xl leading-relaxed max-w-xl">
              Request deliveries in seconds, connect with nearby riders at the
              best cost, or partner with us to manage riders and deliveries
              efficiently—all in one powerful platform.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-6 pt-6">
              <Link
                href="#download"
                className="px-8 py-4 bg-white text-[#337BFF] font-bold rounded-2xl hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Download the App
              </Link>

              <Link
                href="#partners"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-bold rounded-2xl hover:bg-white/20 hover:scale-105 transition-all duration-300"
              >
                Become a Partner
              </Link>
            </div>

            {/* App Store Badges */}
            <div className="flex items-center gap-6 pt-8">
              <div className="hover:scale-105 transition-transform duration-300">
                <Image
                  src="/app-store.svg"
                  alt="Download on App Store"
                  width={160}
                  height={55}
                  className="drop-shadow-lg"
                />
              </div>
              <div className="hover:scale-105 transition-transform duration-300">
                <Image
                  src="/google-play.svg"
                  alt="Get it on Google Play"
                  width={160}
                  height={55}
                  className="drop-shadow-lg"
                />
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-3xl blur-xl opacity-30 animate-pulse" />
              <div className="relative bg-white/15 border border-white/30 backdrop-blur-xl rounded-3xl p-8 shadow-2xl hover:scale-105 transition-transform duration-500">
                <Image
                  src="/deliveries.png"
                  alt="Delivery App Preview"
                  width={380}
                  height={760}
                  className="rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
