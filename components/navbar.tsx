"use client";

import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Features', id: 'features' },
  { label: 'How it works', id: 'how-it-works' },
  { label: 'FAQs', id: 'faqs' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact', id: 'contact' },
];

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
        backgroundColor: scrolled ? "rgba(255,255,255,0.98)" : "rgba(255,255,255,0)",
        borderBottomColor: scrolled ? "#e6e6e6" : "rgba(230,230,230,0)",
        backdropFilter: scrolled ? "blur(12px)" : "none",
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed top-0 inset-x-0 z-50 border-b"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* LOGO */}
          <div className="flex items-center gap-3">
            <Image
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg"
              width={40}
              height={40}
              alt="Riderr logo"
              src="/logo.png"
              priority
            />
            <span className="font-bold text-lg sm:text-xl text-brand-ink tracking-[-0.02em]">RIDERR</span>
          </div>

          {/* DESKTOP NAV LINKS */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              item.href ? (
                <Link key={item.label} href={item.href}>
                  <div className="px-4 py-2 text-[15px] font-medium text-brand-ink-muted hover:text-brand-primary rounded-lg transition-colors duration-150">
                    {item.label}
                  </div>
                </Link>
              ) : (
                <button
                  key={item.label}
                  onClick={() => scrollToSection(item.id!)}
                  className="px-4 py-2 text-[15px] font-medium text-brand-ink-muted hover:text-brand-primary rounded-lg transition-colors duration-150"
                >
                  {item.label}
                </button>
              )
            ))}
          </nav>

          {/* DESKTOP LOGIN & MOBILE MENU BUTTON */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center rounded-lg border border-brand-hairline bg-white px-4 py-2 text-sm font-medium text-brand-ink hover:border-brand-primary/40 hover:text-brand-primary transition-colors duration-150"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="hidden sm:inline-flex items-center rounded-full bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-primary-active transition-colors duration-150"
            >
              Get Riderr free
            </Link>

            {/* MOBILE MENU BUTTON */}
            <motion.button
              className="md:hidden p-2 rounded-lg hover:bg-brand-canvas-soft transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <motion.span
                  className="w-5 h-0.5 bg-brand-ink block mb-1"
                  animate={{
                    rotate: mobileMenuOpen ? 45 : 0,
                    y: mobileMenuOpen ? 6 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                />
                <motion.span
                  className="w-5 h-0.5 bg-brand-ink block mb-1"
                  animate={{
                    opacity: mobileMenuOpen ? 0 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                />
                <motion.span
                  className="w-5 h-0.5 bg-brand-ink block"
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
              className="md:hidden border-t border-brand-hairline bg-white/95 backdrop-blur-sm"
            >
              <div className="px-4 py-6 space-y-2">
                {navItems.map((item) => (
                  item.href ? (
                    <Link key={item.label} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                      <div className="block w-full text-left px-4 py-3 text-base font-medium text-brand-ink-muted hover:text-brand-primary rounded-lg transition-colors duration-150">
                        {item.label}
                      </div>
                    </Link>
                  ) : (
                    <button
                      key={item.label}
                      onClick={() => {
                        scrollToSection(item.id!);
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-3 text-base font-medium text-brand-ink-muted hover:text-brand-primary rounded-lg transition-colors duration-150"
                    >
                      {item.label}
                    </button>
                  )
                ))}
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <div className="w-full mt-2 text-center rounded-lg border border-brand-hairline px-6 py-3 text-base font-medium text-brand-ink">
                    Log in
                  </div>
                </Link>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <div className="w-full mt-2 text-center rounded-full bg-brand-primary px-6 py-3 text-base font-semibold text-white">
                    Get Riderr free
                  </div>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
