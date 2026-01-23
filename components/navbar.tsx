"use client";

import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "motion/react";
import Image from "next/image";
import { useState } from "react";

export default function Navbar() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 80);
  });

  return (
    <motion.header
      animate={{
        backgroundColor: scrolled ? "rgba(255,255,255,0.98)" : "transparent",
        boxShadow: scrolled ? "0 8px 32px rgba(0,0,0,0.08)" : "none",
        backdropFilter: scrolled ? "blur(12px)" : "none",
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed top-0 inset-x-0 z-50 border-b border-transparent"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* LOGO */}
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-[#1E5FD8] to-[#1a4fb8] flex items-center justify-center shadow-lg">
              <Image className="rounded-lg" width={24} height={24} alt="logo" src="/favicon.ico" />
            </div>
            <span className="font-bold text-xl sm:text-2xl text-[#1E5FD8] tracking-tight">RIDERR</span>
          </motion.div>

          {/* DESKTOP NAV LINKS */}
          <nav className="hidden md:flex items-center gap-1">
            {['Features', 'How it works', 'FAQs', 'Contact'].map((item, index) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase().replace(' ', '')}`}
                className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-[#1E5FD8] hover:bg-[#1E5FD8]/5 rounded-lg transition-all duration-200"
                whileHover={{ y: -1 }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {item}
              </motion.a>
            ))}
          </nav>

          {/* DESKTOP LOGIN & MOBILE MENU BUTTON */}
          <div className="flex items-center gap-3">
            <motion.button 
              className="hidden sm:block rounded-full bg-gradient-to-r from-[#1E5FD8] to-[#1a4fb8] px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200"
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              Login
            </motion.button>
            
            {/* MOBILE MENU BUTTON */}
            <motion.button
              className="md:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <motion.span
                  className="w-5 h-0.5 bg-neutral-700 block mb-1"
                  animate={{
                    rotate: mobileMenuOpen ? 45 : 0,
                    y: mobileMenuOpen ? 6 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                />
                <motion.span
                  className="w-5 h-0.5 bg-neutral-700 block mb-1"
                  animate={{
                    opacity: mobileMenuOpen ? 0 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                />
                <motion.span
                  className="w-5 h-0.5 bg-neutral-700 block"
                  animate={{
                    rotate: mobileMenuOpen ? -45 : 0,
                    y: mobileMenuOpen ? -6 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </motion.button>
          </div>
        </div>

        {/* MOBILE MENU */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="md:hidden border-t border-neutral-200 bg-white/95 backdrop-blur-sm"
            >
              <div className="px-4 py-6 space-y-4">
                {['Features', 'How it works', 'FAQs', 'Contact'].map((item, index) => (
                  <motion.a
                    key={item}
                    href={`#${item.toLowerCase().replace(' ', '')}`}
                    className="block px-4 py-3 text-base font-medium text-neutral-700 hover:text-[#1E5FD8] hover:bg-[#1E5FD8]/5 rounded-lg transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {item}
                  </motion.a>
                ))}
                <motion.button
                  className="w-full mt-4 rounded-full bg-gradient-to-r from-[#1E5FD8] to-[#1a4fb8] px-6 py-3 text-base font-semibold text-white shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Login
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
