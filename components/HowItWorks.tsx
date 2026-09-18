"use client";

import { motion } from "framer-motion";

// Custom SVG Icons
const MapPinIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
  </svg>
);

const UserGroupIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
  </svg>
);

const EyeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
  </svg>
);

const steps = [
  {
    step: "01",
    title: "Request a Delivery",
    description:
      "Enter pickup and drop-off details. Riderr instantly scans nearby riders and logistics partners.",
    icon: MapPinIcon,
    color: "from-blue-500 to-blue-600",
  },
  {
    step: "02",
    title: "Smart Rider Matching",
    description:
      "Our system matches you with the most efficient rider based on distance, availability, and pricing.",
    icon: UserGroupIcon,
    color: "from-purple-500 to-purple-600",
  },
  {
    step: "03",
    title: "Track in Real Time",
    description:
      "Follow your delivery live from pickup to drop-off with real-time status updates.",
    icon: EyeIcon,
    color: "from-orange-400 to-orange-500",
  },
  {
    step: "04",
    title: "Delivered & Completed",
    description:
      "Confirm delivery, rate the rider, and keep records — seamless and transparent.",
    icon: CheckCircleIcon,
    color: "from-green-500 to-green-600",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-brand-canvas-soft relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* SECTION HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold leading-tight tracking-[-0.02em] text-brand-ink">
            Simple steps to
            <br />
            <span className="text-brand-primary">fast delivery</span>
          </h2>
          <p className="mt-5 text-brand-ink-muted text-lg max-w-2xl mx-auto">
            From request to delivery, Riderr simplifies logistics with speed,
            transparency, and intelligent automation.
          </p>
        </motion.div>

        {/* STEPS GRID */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative rounded-xl border border-brand-hairline bg-white p-7 hover:shadow-soft transition-shadow duration-300"
              >
                {/* STEP NUMBER */}
                <span className="absolute top-6 right-6 text-xs font-semibold text-brand-ink-faint tracking-wide">
                  {item.step}
                </span>

                {/* ICON */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} p-3 mb-5`}>
                  <IconComponent className="w-full h-full text-white" />
                </div>

                {/* CONTENT */}
                <h3 className="text-lg font-bold mb-2 text-brand-ink">
                  {item.title}
                </h3>
                <p className="text-brand-ink-muted leading-relaxed text-[15px]">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-14"
        >
          <button className="inline-flex items-center gap-2 bg-brand-primary text-white font-semibold px-7 py-3.5 rounded-full hover:bg-brand-primary-active transition-colors duration-200">
            Get Started Now
            <ArrowRightIcon className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
