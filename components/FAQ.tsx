"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const faqs = [
  {
    q: "How are riders verified?",
    a: "All riders undergo a comprehensive verification process by our partner logistics companies. This includes background checks, document verification, and training to ensure safety and professionalism.",
  },
  {
    q: "How is delivery cost calculated?",
    a: "Delivery costs are calculated based on multiple factors including distance, rider availability, time of day, and package size. You'll see the exact price upfront before confirming your delivery request.",
  },
  {
    q: "Can companies manage multiple riders?",
    a: "Yes! Our partner dashboard allows logistics companies to register, manage, and track multiple riders from a single interface. You can monitor performance, assign deliveries, and view real-time analytics.",
  },
  {
    q: "How do I track my delivery?",
    a: "Once your delivery is confirmed, you'll receive real-time GPS tracking updates. You can see your rider's location, estimated arrival time, and delivery status through the app.",
  },
  {
    q: "What payment methods are accepted?",
    a: "We accept various payment methods including credit/debit cards, mobile money, and cash on delivery. All transactions are secure and encrypted for your safety.",
  },
  {
    q: "What if there's an issue with my delivery?",
    a: "Our 24/7 customer support team is always ready to help. You can contact us through the app, WhatsApp, or phone. We also have a dispute resolution system to handle any concerns.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faqs" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-[-0.02em] text-brand-ink mb-4">
            Frequently asked questions
          </h2>
          <p className="text-lg text-brand-ink-muted">
            Everything you need to know about Riderr
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-brand-canvas-soft rounded-xl border border-brand-hairline overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-black/[0.02] transition-colors"
              >
                <h4 className="font-semibold text-[15px] text-brand-ink pr-8">{faq.q}</h4>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  <svg
                    className="w-5 h-5 text-brand-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </motion.div>
              </button>
              <motion.div
                initial={false}
                animate={{
                  height: openIndex === index ? "auto" : 0,
                  opacity: openIndex === index ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-5 text-brand-ink-muted leading-relaxed text-[15px]">
                  {faq.a}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-brand-ink-muted mb-4">Still have questions?</p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 bg-brand-primary text-white font-semibold px-7 py-3.5 rounded-full hover:bg-brand-primary-active transition-colors duration-200"
          >
            Contact Support
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
