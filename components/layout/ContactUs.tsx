"use client";

import { FaPhoneAlt, FaWhatsapp, FaEnvelope } from "react-icons/fa";

export default function ContactUs() {
  return (
    <section
      id="contact"
      className="relative w-full overflow-hidden bg-white text-gray-900"
    >
      {/* Background Accent */}
      <div className="absolute inset-0 bg-linear-to-br from-brand-50 via-white to-brand-100 opacity-70" />

      <div className="relative z-10 container mx-auto px-6 md:px-12 lg:px-20 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
          {/* Left Content */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Get in Touch With Us
            </h2>

            <p className="text-gray-600 text-lg max-w-xl">
              Have questions, want to partner with us, or need support? Reach
              out—we’re here to help you connect, deliver, and grow.
            </p>

            {/* Quick Contact Options */}
            <div className="space-y-4 pt-4">
              <a
                href="tel:+2349026161292"
                className="flex items-center gap-4 p-4 border rounded-xl hover:bg-gray-50 transition"
              >
                <div className="w-12 h-12 bg-brand-600 text-white rounded-full flex items-center justify-center text-xl">
                  <FaPhoneAlt color="#1E91D6" />
                </div>
                <div>
                  <p className="font-semibold">Call Us</p>
                  <p className="text-sm text-gray-600">+234 902 616 1292</p>
                </div>
              </a>

              <a
                href="https://wa.me/09043238328"
                target="_blank"
                className="flex items-center gap-4 p-4 border rounded-xl hover:bg-gray-50 transition"
              >
                <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center text-xl">
                  <FaWhatsapp />
                </div>
                <div>
                  <p className="font-semibold">WhatsApp</p>
                  <p className="text-sm text-gray-600">
                    Chat with our support team
                  </p>
                </div>
              </a>

              <div className="flex items-center gap-4 p-4 border rounded-xl">
                <div className="w-12 h-12 bg-brand-600 text-white rounded-full flex items-center justify-center text-xl">
                  <FaEnvelope color="#1E91D6 " />
                </div>
                <div>
                  <p className="font-semibold">Email</p>
                  <p className="text-sm text-gray-600">
                    riderrlogistics@gmail.com
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form */}
          <div className="bg-white rounded-3xl shadow-xl border p-8">
            <h3 className="text-2xl font-bold mb-6">Send Us a Message</h3>

            <form className="space-y-5">
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full mt-2 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Email Address</label>
                <input
                  type="email"
                  placeholder="youremnail@example.com"
                  className="w-full mt-2 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Message</label>
                <textarea
                  rows={4}
                  placeholder="Tell us how we can help..."
                  className="w-full mt-2 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
