"use client";

import { motion } from "motion/react";
import Navbar from "@/components/navbar";
import Footer from "@/components/layout/Footer";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div>
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-[#1E5FD8] to-[#1a4fb8] text-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">About RIDERR</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Revolutionizing logistics by connecting businesses with verified riders and delivery partners across Nigeria.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl border border-blue-100"
            >
              <h2 className="text-3xl font-bold text-[#1E5FD8] mb-4">Our Mission</h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                To simplify and streamline logistics by providing a reliable, transparent, and efficient platform that connects businesses with trusted delivery partners, ensuring fast and secure deliveries every time.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl border border-purple-100"
            >
              <h2 className="text-3xl font-bold text-purple-600 mb-4">Our Vision</h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                To become Africa's leading logistics platform, empowering businesses and riders with technology-driven solutions that make delivery seamless, affordable, and accessible to everyone.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
            <div className="max-w-4xl mx-auto text-gray-700 text-lg leading-relaxed space-y-4">
              <p>
                RIDERR was born from a simple observation: businesses struggle to find reliable, affordable delivery solutions, while skilled riders and logistics companies lack a unified platform to showcase their services.
              </p>
              <p>
                We set out to bridge this gap by creating a smart, transparent marketplace that benefits everyone—businesses get fast deliveries, riders get more opportunities, and customers enjoy peace of mind with real-time tracking and verified partners.
              </p>
              <p>
                Today, RIDERR is transforming how deliveries are made across Nigeria, one package at a time.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center text-gray-900 mb-16"
          >
            Our Core Values
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Reliability",
                description: "We ensure every delivery is handled with care and professionalism by verified partners.",
                icon: "✓"
              },
              {
                title: "Transparency",
                description: "Real-time tracking and clear pricing—no hidden fees, no surprises.",
                icon: "👁"
              },
              {
                title: "Innovation",
                description: "We leverage technology to make logistics smarter, faster, and more efficient.",
                icon: "⚡"
              },
              {
                title: "Trust",
                description: "All riders and logistics companies are thoroughly verified for your peace of mind.",
                icon: "🛡"
              },
              {
                title: "Speed",
                description: "Quick matching and fast deliveries to keep your business moving forward.",
                icon: "🚀"
              },
              {
                title: "Community",
                description: "We empower riders and businesses to grow together in a supportive ecosystem.",
                icon: "🤝"
              }
            ].map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200 hover:border-[#1E5FD8] hover:shadow-lg transition-all"
              >
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#1E5FD8] to-[#1a4fb8] text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">Join the RIDERR Community</h2>
            <p className="text-xl text-white/90 mb-8">
              Whether you're a business looking for reliable deliveries or a rider seeking opportunities, RIDERR is here for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-white text-[#1E5FD8] font-semibold rounded-full hover:shadow-xl transition-all"
              >
                Get Started
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-[#1E5FD8] transition-all"
              >
                Contact Us
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
