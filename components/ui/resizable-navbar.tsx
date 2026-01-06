"use client";

import { cn } from "@/lib/utils";
import { motion, useScroll, useMotionValueEvent } from "motion/react";
import React, { useState } from "react";

interface NavbarProps {
  children: React.ReactNode;
}

export const Navbar = ({ children }: NavbarProps) => {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 80);
  });

  return (
    <motion.header
      animate={{
        backgroundColor: scrolled ? "rgba(255,255,255,0.96)" : "transparent",
        boxShadow: scrolled ? "0 10px 30px rgba(0,0,0,0.08)" : "none",
      }}
      transition={{ duration: 0.25 }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        {React.Children.map(children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(child as React.ReactElement<any>, {
                scrolled,
              })
            : child
        )}
      </div>
    </motion.header>
  );
};

/* -------------------------------------------------------------------------- */
/* LOGO */
/* -------------------------------------------------------------------------- */

export const NavbarLogo = ({ scrolled }: { scrolled?: boolean }) => {
  return (
    <span
      className={cn(
        "text-2xl font-bold lowercase tracking-tight transition-colors",
        scrolled ? "text-neutral-900" : "text-white"
      )}
    >
      riderr
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/* NAV ITEMS (CENTER GLASS PILL) */
/* -------------------------------------------------------------------------- */

export const NavItems = ({
  items,
  scrolled,
}: {
  items: { name: string; link: string }[];
  scrolled?: boolean;
}) => {
  return (
    <div
      className={cn(
        "hidden md:flex rounded-full px-8 py-3 backdrop-blur-md",
        scrolled ? "bg-neutral-100" : "bg-white/10"
      )}
    >
      <nav
        className={cn(
          "flex items-center gap-8 text-sm font-medium transition-colors",
          scrolled ? "text-neutral-800" : "text-white"
        )}
      >
        {items.map((item) => (
          <a
            key={item.name}
            href={item.link}
            className="transition hover:opacity-70"
          >
            {item.name}
          </a>
        ))}
      </nav>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* BUTTON */
/* -------------------------------------------------------------------------- */

export const NavbarButton = ({
  scrolled,
  children,
}: {
  scrolled?: boolean;
  children: React.ReactNode;
}) => {
  return (
    <button
      className={cn(
        "rounded-full px-6 py-2 text-sm font-semibold transition",
        scrolled
          ? "bg-neutral-900 text-white"
          : "bg-black text-white"
      )}
    >
      {children}
    </button>
  );
};
