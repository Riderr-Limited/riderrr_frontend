"use client";

import { motion, useScroll, useMotionValueEvent } from "motion/react";
import Image from "next/image";
import { useState } from "react";

export default function Navbar() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 80);
  });

  return (
    <motion.header
      animate={{
        backgroundColor: scrolled ? "rgba(255,255,255,0.96)" : "transparent",
        boxShadow: scrolled ? "0 8px 24px rgba(0,0,0,0.06)" : "none",
      }}
      transition={{ duration: 0.25 }}
      className="fixed top-0 inset-x-0 z-50"
    >
      <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
        {/* LOGO */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-[#1E5FD8] flex items-center justify-center text-white font-bold">
            <Image className="rounded-3xl" width={100} height={100} alt="logo" src="/favicon.ico"  />
          </div>
          <span className="font-bold text-lg text-[#1E5FD8]">RIDERR</span>
        </div>

        {/* NAV LINKS */}
        <nav className="hidden md:flex items-center gap-8 text-l font-medium text-neutral-800">
          <a href="#features" className="hover:text-[#1E5FD8] transition">
            Features
          </a>
          <a href="#how" className="hover:text-[#1E5FD8] transition">
            How it works
          </a>
          <a href="#faqs" className="hover:text-[#1E5FD8] transition">
            FAQs
          </a>
          <a href="#contact" className="hover:text-[#1E5FD8] transition">
            Contact
          </a>
        </nav>

        {/* LOGIN BUTTON */}
        <button className="rounded-full bg-[#1E5FD8] px-6 py-2 text-sm font-semibold text-white hover:opacity-90 transition">
          Login
        </button>
      </div>
    </motion.header>
  );
}
