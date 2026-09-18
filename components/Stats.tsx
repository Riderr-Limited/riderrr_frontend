"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const stats = [
  { label: "Deliveries Completed", value: 1000, suffix: "+" },
  { label: "Active Riders", value: 300, suffix: "+" },
  { label: "Partner Companies", value: 50, suffix: "+" },
  { label: "Cities Covered", value: 5, suffix: "+" },
];

function Counter({ end, duration = 2 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!hasAnimated) return;
    
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = (currentTime - startTime) / (duration * 1000);

      if (progress < 1) {
        setCount(Math.floor(end * progress));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, hasAnimated]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      onViewportEnter={() => setHasAnimated(true)}
    >
      {count}
    </motion.div>
  );
}

export function Stats() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-[-0.02em] text-brand-ink mb-4">
            Trusted by thousands
          </h2>
          <p className="text-lg text-brand-ink-muted max-w-2xl mx-auto">
            Join our growing community of users, riders, and logistics partners
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-brand-canvas-soft rounded-xl p-8 border border-brand-hairline"
            >
              <h3 className="text-4xl md:text-5xl font-bold text-brand-primary mb-2 tracking-[-0.02em]">
                <Counter end={stat.value} />
                {stat.suffix}
              </h3>
              <p className="text-brand-ink-muted font-medium text-sm md:text-base">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
