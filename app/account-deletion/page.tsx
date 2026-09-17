"use client";

import Link from "next/link";
import { useState } from "react";

const sections = [
  {
    id: "what-happens",
    title: "1. What Happens When You Delete Your Account",
    content: (
      <div className="space-y-4">
        {[
          {
            heading: "Data Removed",
            items: [
              "Your profile information (name, email, phone number, profile photo)",
              "Your delivery history and preferences",
              "Your saved addresses",
              "Your account credentials",
            ],
          },
          {
            heading: "Data We May Retain",
            items: [
              "Transaction records required for financial and legal compliance",
              "Information needed to resolve disputes or prevent fraud",
              "Data required by applicable Nigerian law",
            ],
            note: "Retained data is kept only as long as legally required and is not used for marketing or service purposes.",
          },
        ].map(({ heading, items, note }) => (
          <div key={heading} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-2">{heading}</h3>
            <ul className="space-y-1">
              {items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-gray-600 text-sm">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#1E5FD8] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            {note && (
              <p className="mt-3 text-sm text-gray-500 italic border-t border-gray-200 pt-3">
                {note}
              </p>
            )}
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "before-you-request",
    title: "2. Before You Submit a Request",
    content: (
      <ul className="space-y-2">
        {[
          "Ensure all pending deliveries are completed or cancelled.",
          "Withdraw any outstanding wallet balance before requesting deletion.",
          "Note that account deletion is permanent and cannot be undone.",
          "If you are a logistics company admin, ensure your riders are properly offboarded.",
          "Deletion requests are typically processed within 30 days.",
        ].map((item) => (
          <li key={item} className="flex items-start gap-2 text-gray-600">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#1E5FD8] shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: "request-form",
    title: "3. Submit Your Deletion Request",
    content: <DeletionForm />,
  },
  {
    id: "contact",
    title: "4. Need Help?",
    content: (
      <>
        <p className="text-gray-600 mb-4">
          If you have questions about the deletion process, contact us:
        </p>
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-2 text-sm text-gray-700">
          <p><span className="font-semibold">Email:</span> contact@riderr.ng</p>
          <p><span className="font-semibold">WhatsApp:</span> +234 904 323 8328</p>
          <p><span className="font-semibold">Location:</span> Nigeria</p>
        </div>
      </>
    ),
  },
];

function DeletionForm() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      const res = await fetch("https://riderr-backend.onrender.com/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, subject: "account-deletion-request" }),
      });

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
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <p className="text-gray-600 mb-6">
        Fill in the form below and our team will process your request within 30 days.
      </p>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
          <input
            type="text"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email Address (used on your Riderr account)
          </label>
          <input
            type="email"
            placeholder="youremail@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Reason for Deletion (optional)
          </label>
          <textarea
            rows={4}
            placeholder="Let us know why you're leaving (optional)..."
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
          />
        </div>

        {status === "success" && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-center">
            ✓ Request submitted successfully. We&apos;ll process it within 30 days.
          </div>
        )}
        {status === "error" && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-center">
            Failed to submit request. Please try again or email us directly.
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-2xl hover:from-red-600 hover:to-red-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Submitting..." : "Submit Deletion Request"}
        </button>
      </form>
    </div>
  );
}

export default function AccountDeletion() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#1E5FD8] to-[#1a4fb8] text-white py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm mb-8 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <span className="text-blue-200 text-sm font-medium uppercase tracking-wider">Account</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Account Deletion Request</h1>
          <p className="text-blue-200 text-sm">Last Updated: June 2025</p>
          <p className="text-blue-100 mt-4 max-w-2xl leading-relaxed">
            You have the right to request deletion of your Riderr account and personal data. Please read the information below before submitting your request.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Table of Contents */}
          <aside className="lg:w-64 shrink-0">
            <div className="sticky top-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Contents
              </p>
              <nav className="space-y-1">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="block text-sm text-gray-500 hover:text-[#1E5FD8] py-1 transition-colors leading-snug"
                  >
                    {s.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-8">
            {sections.map((s) => (
              <section
                key={s.id}
                id={s.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 scroll-mt-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
                  {s.title}
                </h2>
                {s.content}
              </section>
            ))}

            {/* Footer note */}
            <div className="bg-gradient-to-r from-[#1E5FD8]/5 to-blue-50 rounded-2xl border border-blue-100 p-6 text-center">
              <p className="text-gray-600 text-sm">
                We respect your right to privacy and will handle your request with care.
              </p>
              <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                <Link href="/privacy-policy" className="text-[#1E5FD8] hover:underline">
                  Privacy Policy
                </Link>
                <span className="text-gray-300">|</span>
                <Link href="/terms-of-service" className="text-[#1E5FD8] hover:underline">
                  Terms of Service
                </Link>
                <span className="text-gray-300">|</span>
                <Link href="/cookie-policy" className="text-[#1E5FD8] hover:underline">
                  Cookie Policy
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
