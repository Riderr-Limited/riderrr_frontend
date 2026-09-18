"use client";

import { motion } from "framer-motion";
import Link from "next/link";

// Custom SVG Icons
const HandshakeIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
    />
  </svg>
);

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
    />
  </svg>
);

export function PartnerCTA() {
  return (
    <section className="py-28 bg-brand-secondary text-white relative overflow-hidden">
      {/* Decorative sticker constellation — the site's single dark "night" moment */}
      <div className="absolute top-16 left-[12%] w-2 h-2 rounded-full bg-sky-300/70" />
      <div className="absolute top-32 right-[18%] w-1.5 h-1.5 rounded-full bg-pink-300/70" />
      <div className="absolute bottom-24 left-[22%] w-1.5 h-1.5 rounded-full bg-orange-300/70" />
      <div className="absolute bottom-16 right-[28%] w-2 h-2 rounded-full bg-teal-300/70" />
      <div className="absolute top-1/2 left-[8%] w-1 h-1 rounded-full bg-white/60" />
      <div className="absolute top-1/3 right-[10%] w-1 h-1 rounded-full bg-white/60" />

      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {/* Icon */}
          <div className="mb-8">
            <div className="w-16 h-16 rounded-2xl bg-white p-4 mx-auto">
              <HandshakeIcon className="w-full h-full text-brand-primary" />
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-4xl md:text-5xl font-bold leading-tight tracking-[-0.02em] mb-5">
            Partner with Riderr
          </h2>

          {/* Description */}
          <p className="max-w-2xl mx-auto text-white/70 text-lg mb-9 leading-relaxed">
            Grow your logistics business with more delivery requests and
            powerful rider management tools. Join our network today.
          </p>

          {/* CTA Button */}
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-white text-brand-ink font-semibold px-7 py-3.5 rounded-full hover:bg-white/90 transition-colors duration-200"
          >
            Become a Partner
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
