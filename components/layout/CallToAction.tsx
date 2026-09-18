"use client";

import Image from "next/image";
import Link from "next/link";

export default function CallToAction() {
  return (
    <section className="relative w-full overflow-hidden bg-brand-canvas-soft">
      <div className="relative z-10 container mx-auto px-6 md:px-12 lg:px-20 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-7">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight tracking-[-0.02em] text-brand-ink">
              Deliver faster. <span className="text-brand-primary">Earn more.</span> Scale smarter.
            </h2>

            <p className="text-brand-ink-muted text-lg leading-relaxed max-w-xl">
              Request deliveries in seconds, connect with nearby riders at the
              best cost, or partner with us to manage riders and deliveries
              efficiently—all in one powerful platform.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="#download"
                className="px-7 py-3.5 bg-brand-primary text-white font-semibold rounded-full hover:bg-brand-primary-active transition-colors duration-200"
              >
                Download the App
              </Link>

              <Link
                href="#partners"
                className="px-7 py-3.5 bg-white border border-brand-hairline text-brand-ink font-semibold rounded-full shadow-soft hover:border-brand-primary/40 transition-colors duration-200"
              >
                Become a Partner
              </Link>
            </div>

            {/* App Store Badges */}
            <div className="flex items-center gap-6 pt-6">
              <div className="hover:scale-105 transition-transform duration-300">
                <Image
                  src="/app-store.svg"
                  alt="Download on App Store"
                  width={150}
                  height={50}
                />
              </div>
              <div className="hover:scale-105 transition-transform duration-300">
                <Image
                  src="/google-play.svg"
                  alt="Get it on Google Play"
                  width={150}
                  height={50}
                />
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative bg-white border border-brand-hairline rounded-2xl p-6 shadow-elevated">
              <Image
                src="/deliveries.png"
                alt="Delivery App Preview"
                width={340}
                height={680}
                className="rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
