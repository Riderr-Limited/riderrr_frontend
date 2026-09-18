"use client";

import { FaPhoneAlt, FaWhatsapp, FaEnvelope } from "react-icons/fa";
import { useState } from "react";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      const res = await fetch(
        "https://riderr-backend.onrender.com/api/contact",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, subject: "contact" }),
        },
      );

      if (res.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <section
      id="contact"
      className="relative w-full overflow-hidden bg-white text-brand-ink"
    >
      <div className="relative z-10 container mx-auto px-6 md:px-12 lg:px-20 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
          {/* Left Content */}
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold tracking-[-0.02em] text-brand-ink">
              Get in touch with us
            </h2>

            <p className="text-brand-ink-muted text-lg max-w-xl">
              Have questions, want to partner with us, or need support? Reach
              out—we’re here to help you connect, deliver, and grow.
            </p>

            {/* Quick Contact Options */}
            <div className="space-y-3 pt-4">
              <a
                href="tel:+2349026161292"
                className="flex items-center gap-4 p-5 bg-white border border-brand-hairline rounded-xl hover:shadow-soft transition-shadow duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center text-lg">
                  <FaPhoneAlt />
                </div>
                <div>
                  <p className="font-semibold text-brand-ink">Call Us</p>
                  <p className="text-sm text-brand-ink-muted">+234 902 616 1292</p>
                </div>
              </a>

              <a
                href="https://wa.me/09043238328"
                target="_blank"
                className="flex items-center gap-4 p-5 bg-white border border-brand-hairline rounded-xl hover:shadow-soft transition-shadow duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl flex items-center justify-center text-lg">
                  <FaWhatsapp />
                </div>
                <div>
                  <p className="font-semibold text-brand-ink">WhatsApp</p>
                  <p className="text-sm text-brand-ink-muted">
                    Chat with our support team
                  </p>
                </div>
              </a>

              <div className="flex items-center gap-4 p-5 bg-white border border-brand-hairline rounded-xl">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl flex items-center justify-center text-lg">
                  <FaEnvelope />
                </div>
                <div>
                  <p className="font-semibold text-brand-ink">Email</p>
                  <p className="text-sm text-brand-ink-muted">contact@riderr.ng</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form */}
          <div className="bg-brand-canvas-soft rounded-xl border border-brand-hairline p-8 lg:p-10">
            <h3 className="text-xl font-bold mb-7 text-brand-ink">
              Send Us a Message
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-brand-ink-secondary mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 bg-white border border-brand-hairline rounded focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-ink-secondary mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="youremail@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 bg-white border border-brand-hairline rounded focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-ink-secondary mb-2">
                  Message
                </label>
                <textarea
                  rows={5}
                  placeholder="Tell us how we can help..."
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 bg-white border border-brand-hairline rounded focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all resize-none"
                />
              </div>

              {status === "success" && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-center text-sm">
                  ✓ Message sent successfully! We&apos;ll get back to you soon.
                </div>
              )}
              {status === "error" && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center text-sm">
                  Failed to send message. Please try again.
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-brand-primary text-white font-semibold rounded-full hover:bg-brand-primary-active transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
