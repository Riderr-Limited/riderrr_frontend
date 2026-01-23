"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const steps = [
  {
    step: "01",
    title: "Request a Delivery",
    description:
      "Enter pickup and drop-off details. Riderr instantly scans nearby riders and logistics partners.",
    icon: "/icons/request.svg",
  },
  {
    step: "02",
    title: "Smart Rider Matching",
    description:
      "Our system matches you with the most efficient rider based on distance, availability, and pricing.",
    icon: "/icons/match.svg",
  },
  {
    step: "03",
    title: "Track in Real Time",
    description:
      "Follow your delivery live from pickup to drop-off with real-time status updates.",
    icon: "/icons/track.svg",
  },
  {
    step: "04",
    title: "Delivered & Completed",
    description:
      "Confirm delivery, rate the rider, and keep records — seamless and transparent.",
    icon: "/icons/deliver.svg",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-28 bg-[#0B0B0B] text-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* SECTION HEADER */}
        <div className="max-w-3xl mb-20">
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
            How Riderr <span className="text-yellow-400">Works</span>
          </h2>
          <p className="mt-6 text-white/70 text-lg">
            From request to delivery, Riderr simplifies logistics with speed,
            transparency, and intelligent automation.
          </p>
        </div>

        {/* STEPS GRID */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 hover:bg-white/10 transition"
            >
              {/* STEP NUMBER */}
              <span className="absolute top-6 right-6 text-sm font-semibold text-white/30">
                {item.step}
              </span>

              {/* ICON */}
              <div className="mb-6">
                <Image
                  src={item.icon}
                  alt={item.title}
                  width={48}
                  height={48}
                />
              </div>

              {/* CONTENT */}
              <h3 className="text-xl font-semibold mb-3">
                {item.title}
              </h3>
              <p className="text-white/70 leading-relaxed text-sm">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
