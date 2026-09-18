"use client";

import { motion } from "motion/react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/layout/Footer";

const icon = (d: string) => (
  <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);

const values = [
  {
    title: "Reliability",
    description:
      "We ensure every delivery is handled with care and professionalism by verified partners.",
    icon: icon("M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"),
  },
  {
    title: "Transparency",
    description:
      "Real-time tracking and clear pricing—no hidden fees, no surprises.",
    icon: icon("M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"),
  },
  {
    title: "Innovation",
    description:
      "We leverage technology to make logistics smarter, faster, and more efficient.",
    icon: icon("m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"),
  },
  {
    title: "Trust",
    description:
      "All riders and logistics companies are thoroughly verified for your peace of mind.",
    icon: icon("M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"),
  },
  {
    title: "Speed",
    description:
      "Quick matching and fast deliveries to keep your business moving forward.",
    icon: icon("M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"),
  },
  {
    title: "Community",
    description:
      "We empower riders and businesses to grow together in a supportive ecosystem.",
    icon: icon("M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"),
  },
];

export default function AboutPage() {
  return (
    <div>
      <Navbar />

      {/* Hero */}
      <section className="pt-40 pb-24 bg-brand-canvas-soft">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold tracking-[-0.03em] text-brand-ink mb-6">
              About <span className="text-brand-primary">RIDERR</span>
            </h1>
            <p className="text-lg md:text-xl text-brand-ink-muted max-w-3xl mx-auto leading-relaxed">
              Revolutionizing logistics by connecting businesses with verified
              riders and delivery partners across Nigeria.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Our Mission",
                text: "To simplify and streamline logistics by providing a reliable, transparent, and efficient platform that connects businesses with trusted delivery partners, ensuring fast and secure deliveries every time.",
              },
              {
                title: "Our Vision",
                text: "To become Africa's leading logistics platform, empowering businesses and riders with technology-driven solutions that make delivery seamless, affordable, and accessible to everyone.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-brand-canvas-soft p-8 rounded-xl border border-brand-hairline"
              >
                <h2 className="text-2xl font-bold tracking-[-0.01em] text-brand-ink mb-4">
                  {item.title}
                </h2>
                <p className="text-brand-ink-muted leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-24 bg-brand-canvas-soft">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-[-0.02em] text-brand-ink mb-8">
              Our story
            </h2>
            <div className="text-brand-ink-muted text-lg leading-relaxed space-y-4">
              <p>
                RIDERR was born from a simple observation: businesses struggle
                to find reliable, affordable delivery solutions, while skilled
                riders and logistics companies lack a unified platform to
                showcase their services.
              </p>
              <p>
                We set out to bridge this gap by creating a smart, transparent
                marketplace that benefits everyone—businesses get fast
                deliveries, riders get more opportunities, and customers enjoy
                peace of mind with real-time tracking and verified partners.
              </p>
              <p>
                Today, RIDERR is transforming how deliveries are made across
                Nigeria, one package at a time.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center tracking-[-0.02em] text-brand-ink mb-16"
          >
            Our core values
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                viewport={{ once: true }}
                className="bg-white p-7 rounded-xl border border-brand-hairline hover:shadow-soft transition-shadow duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-primary p-3 text-white mb-5">
                  {value.icon}
                </div>
                <h3 className="text-lg font-bold text-brand-ink mb-2">
                  {value.title}
                </h3>
                <p className="text-brand-ink-muted text-[15px] leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — the page's single dark band */}
      <section className="py-24 bg-brand-secondary text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-[-0.02em] mb-5">
              Join the RIDERR community
            </h2>
            <p className="text-lg text-white/70 mb-9 leading-relaxed">
              Whether you&apos;re a business looking for reliable deliveries or
              a rider seeking opportunities, RIDERR is here for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/signup"
                className="px-7 py-3.5 bg-white text-brand-ink font-semibold rounded-full hover:bg-white/90 transition-colors"
              >
                Get Started
              </Link>
              <Link
                href="/#contact"
                className="px-7 py-3.5 border border-white/30 text-white font-semibold rounded-full hover:bg-white/10 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
