"use client";

import { FaPhoneAlt, FaWhatsapp, FaEnvelope } from "react-icons/fa";

export default function ContactUs() {
  return (
    <section
      id="contact"
      className="relative w-full overflow-hidden bg-gradient-to-br from-gray-50 via-white to-blue-50 text-gray-900"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(30,145,214,0.05)_0%,transparent_50%)]" />

      <div className="relative z-10 container mx-auto px-6 md:px-12 lg:px-20 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
          {/* Left Content */}
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
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
                className="group flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                  <FaPhoneAlt />
                </div>
                <div>
                  <p className="font-semibold">Call Us</p>
                  <p className="text-sm text-gray-600">+234 902 616 1292</p>
                </div>
              </a>

              <a
                href="https://wa.me/09043238328"
                target="_blank"
                className="group flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-2xl hover:border-green-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                  <FaWhatsapp />
                </div>
                <div>
                  <p className="font-semibold">WhatsApp</p>
                  <p className="text-sm text-gray-600">
                    Chat with our support team
                  </p>
                </div>
              </a>

              <div className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-2xl">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl flex items-center justify-center text-lg">
                  <FaEnvelope />
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
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 lg:p-10">
            <h3 className="text-2xl font-bold mb-8 text-gray-900">Send Us a Message</h3>

            <form className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="youremail@example.com"
                  className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                <textarea
                  rows={5}
                  placeholder="Tell us how we can help..."
                  className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-blue-800 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
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
