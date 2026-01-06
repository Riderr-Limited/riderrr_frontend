"use client";

import {
  Navbar,
  NavBody,
  NavItems,
  NavbarLogo,
  NavbarButton,
  MobileNav,
} from "@/components/ui/resizable-navbar";

export function NavbarDemo() {
  const navItems = [
    { name: "Features", link: "#features" },
    { name: "How it Works", link: "#work" },
    { name: "FAQs", link: "#faqs" },
    { name: "Contact", link: "#contact" },
  ];

  return (
    <Navbar>
      {/* LEFT */}
      <NavbarLogo />

      {/* CENTER BLACK PILL */}
      <NavBody>
        <NavItems items={navItems} />
      </NavBody>

      {/* RIGHT */}
      <NavbarButton>Login</NavbarButton>

      {/* MOBILE */}
      <MobileNav items={navItems} />
    </Navbar>
  );
}
