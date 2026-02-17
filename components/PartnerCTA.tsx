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
    <section className="py-28 bg-gradient-to-br from-[#1E5FD8] via-slate-900 to-[#1E5FD8] text-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#1E5FD8]/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#1E5FD8]/20 rounded-full blur-3xl" />

      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-white/80">
              Partnership
            </span>
          </div>

          {/* Icon */}
          <div className="mb-8">
            <div className="w-20 h-20 rounded-2xl bg-white p-5 shadow-lg mx-auto">
              <HandshakeIcon className="w-full h-full text-[#1E5FD8]" />
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-5xl md:text-6xl font-extrabold leading-tight bg-gradient-to-r from-white via-white to-yellow-400 bg-clip-text text-transparent mb-6">
            Partner With
            <br />
            <span className="text-yellow-400">Riderr</span>
          </h2>

          {/* Description */}
          <p className="max-w-2xl mx-auto text-white/70 text-xl mb-10 leading-relaxed">
            Grow your logistics business with more delivery requests and
            powerful rider management tools. Join our network today.
          </p>

          {/* CTA Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold px-8 py-4 rounded-full hover:shadow-lg hover:shadow-yellow-400/25 transition-all duration-300"
          >
            <Link href={"/signup"}>Become a Partner</Link>
            <ArrowRightIcon className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
