"use client";

import { motion } from "motion/react";
import Image from "next/image";
import {
  Navbar,
  NavbarLogo,
  NavItems,
  NavbarButton,
} from "@/components/ui/resizable-navbar";

export default function HeroSectionOne() {
  const navItems = [
    { name: "Features", link: "#features" },
    { name: "How it Works", link: "#work" },
    { name: "FAQs", link: "#faqs" },
    { name: "Contact", link: "#contact" },
  ];

  return (
    <section className="relative h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
      {/* ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-260px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl" />
      </div>

      {/* NAVBAR */}
      <Navbar>
        <NavbarLogo />
        <NavItems items={navItems} />
        <NavbarButton>Login</NavbarButton>
      </Navbar>

      {/* HERO CONTENT */}
      <div className="relative mx-auto grid h-full max-w-7xl grid-cols-1 items-center px-6 md:grid-cols-2 gap-6">
        {/* LEFT — TEXT */}
        <div className="flex flex-col justify-center h-full">
          <h1 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-extrabold leading-snug text-white">
            Fast.
            <br />
            Reliable.
            <br />
            Logistics, simplified.
          </h1>

          <p className="mt-3 text-sm sm:text-base md:text-base text-neutral-200 max-w-md">
            Riderr connects customers, riders, and logistics companies on one
            platform — enabling instant delivery requests, smart rider matching,
            and real-time operations.
          </p>

          <div className="mt-5 flex flex-wrap gap-4">
            <button className="rounded-xl bg-black px-5 py-2 text-sm sm:text-base font-semibold text-white transition hover:opacity-90">
              Start Now
            </button>

            <button className="rounded-xl border border-white/30 px-5 py-2 text-sm sm:text-base font-semibold text-white transition hover:bg-white/10">
              Contact Us
            </button>
          </div>
        </div>

        {/* RIGHT — PHONE (slightly cropped bottom) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex justify-center items-start h-full"
        >
          <div className="relative w-full max-w-[360px] h-full overflow-hidden rounded-[40px]">
            <Image
              src="/home.png"
              alt="Riderr app interface"
              fill
              style={{ objectFit: 'cover', objectPosition: 'top' }}
              className="rounded-[40px]"
              priority
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
