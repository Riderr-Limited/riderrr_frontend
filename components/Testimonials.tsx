"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Small Business Owner",
    image: "/1.jpeg",
    content: "Riderr has transformed how we handle deliveries. The real-time tracking and reliable riders have made our operations so much smoother. Highly recommend!",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Logistics Manager",
    image: "/2.jpeg",
    content: "Managing our fleet of riders has never been easier. The dashboard gives us complete visibility and control. It's a game-changer for our business.",
    rating: 5,
  },
  {
    name: "Aisha Mohammed",
    role: "E-commerce Entrepreneur",
    image: "/3.jpeg",
    content: "Fast, affordable, and transparent pricing. Riderr connects me with nearby riders instantly. My customers love the quick delivery times!",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-24 bg-brand-canvas-soft relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-[-0.02em] text-brand-ink mb-4">
            What our users say
          </h2>
          <p className="text-lg text-brand-ink-muted max-w-2xl mx-auto">
            Join thousands of satisfied customers and partners who trust Riderr
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-7 border border-brand-hairline hover:shadow-soft transition-shadow duration-300"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-4 h-4 text-brand-primary fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Content */}
              <p className="text-brand-ink-secondary leading-relaxed mb-6 text-[15px]">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full overflow-hidden bg-brand-canvas-soft">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={44}
                    height={44}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-brand-ink text-sm">{testimonial.name}</h4>
                  <p className="text-xs text-brand-ink-faint">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
