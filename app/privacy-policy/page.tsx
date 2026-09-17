import Link from "next/link";

const sections = [
  {
    id: "information-we-collect",
    title: "1. Information We Collect",
    content: (
      <>
        <p className="text-gray-600 mb-4">
          We may collect the following information when you use Riderr:
        </p>
        <div className="space-y-4">
          {[
            {
              heading: "Account Information",
              items: [
                "Full name",
                "Email address",
                "Phone number",
                "Password",
                "Profile photo, if provided",
                "Account type (customer, rider, or logistics company)",
              ],
            },
            {
              heading: "Delivery Information",
              items: [
                "Pickup and delivery addresses",
                "Delivery instructions",
                "Recipient details",
                "Parcel or order information",
                "Delivery status and history",
              ],
            },
            {
              heading: "Location Information",
              items: [
                "Real-time location to connect customers with available riders",
                "Pickup and delivery coordination data",
                "Delivery tracking information",
              ],
              note: "You can manage location permissions through your device settings. Some features may not work properly without location access.",
            },
            {
              heading: "Payment Information",
              items: [
                "Transaction references",
                "Payment status and history",
              ],
              note: "We do not intend to store your full debit or credit card details on our own servers when payments are processed by a third-party payment provider.",
            },
            {
              heading: "Device and Usage Information",
              items: [
                "Device type and operating system",
                "App version",
                "IP address",
                "Login and activity information",
                "Error and diagnostic information",
              ],
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
      </>
    ),
  },
  {
    id: "how-we-use",
    title: "2. How We Use Your Information",
    content: (
      <ul className="space-y-2">
        {[
          "Create and manage your account.",
          "Connect customers with riders and logistics companies.",
          "Process and manage delivery requests.",
          "Help riders receive and complete assigned jobs.",
          "Allow logistics companies to manage riders and deliveries.",
          "Provide delivery tracking and status updates.",
          "Process payments and maintain transaction records.",
          "Send important notifications about your account and deliveries.",
          "Improve the performance, security, and features of Riderr.",
          "Prevent fraud, misuse, and unauthorized access.",
          "Comply with applicable laws and legal obligations.",
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
    id: "how-we-share",
    title: "3. How We Share Your Information",
    content: (
      <>
        <p className="text-gray-600 mb-4 font-medium">
          We do not sell your personal information.
        </p>
        <div className="space-y-4">
          {[
            {
              heading: "Riders and Customers",
              body: "When a delivery is requested, information needed to complete the delivery may be shared between the customer and assigned rider — such as pickup location, delivery address, recipient details, and delivery instructions.",
            },
            {
              heading: "Logistics Companies",
              body: "If you request a delivery through a logistics company using Riderr, relevant information may be shared with that company to manage and complete your delivery.",
            },
            {
              heading: "Service Providers",
              body: "We may share information with trusted service providers including cloud hosting, database, payment, map and location, and notification providers. These providers may process information only as needed to provide their services.",
            },
            {
              heading: "Legal Requirements",
              body: "We may disclose information when required by law, legal process, or to protect the safety, rights, and security of Riderr, our users, or others.",
            },
          ].map(({ heading, body }) => (
            <div key={heading} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-1">{heading}</h3>
              <p className="text-gray-600 text-sm">{body}</p>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    id: "location-tracking",
    title: "4. Location and Delivery Tracking",
    content: (
      <>
        <p className="text-gray-600 mb-4">
          Riderr may use location information to support delivery services. Depending on the features you use, location may be used to:
        </p>
        <ul className="space-y-2 mb-4">
          {[
            "Help identify available riders.",
            "Support pickup and delivery coordination.",
            "Provide delivery tracking.",
            "Improve delivery operations.",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-gray-600">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#1E5FD8] shrink-0" />
              {item}
            </li>
          ))}
        </ul>
        <p className="text-gray-600">
          We only request location permissions when needed for relevant features. If background location is used in the app, we will explain the purpose and request the required permission.
        </p>
      </>
    ),
  },
  {
    id: "data-storage",
    title: "5. Data Storage and Security",
    content: (
      <p className="text-gray-600">
        We take reasonable steps to protect your personal information from unauthorized access, loss, misuse, or disclosure. Your information may be stored using third-party cloud services and databases. However, no online service is completely secure, and we cannot guarantee absolute security of your information.
      </p>
    ),
  },
  {
    id: "data-retention",
    title: "6. How Long We Keep Your Information",
    content: (
      <p className="text-gray-600">
        We keep your information for as long as necessary to provide our services, maintain business and transaction records, resolve disputes, prevent fraud, and comply with legal obligations. When information is no longer needed, we will take reasonable steps to delete it or make it anonymous, subject to applicable legal requirements.
      </p>
    ),
  },
  {
    id: "your-rights",
    title: "7. Your Privacy Rights",
    content: (
      <>
        <p className="text-gray-600 mb-4">
          Depending on applicable law, you may have the right to:
        </p>
        <ul className="space-y-2">
          {[
            "Request access to your personal information.",
            "Request correction of inaccurate information.",
            "Request deletion of your account and personal information.",
            "Withdraw consent where processing is based on consent.",
            "Ask questions about how we use your information.",
            "Submit a privacy complaint.",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-gray-600">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#1E5FD8] shrink-0" />
              {item}
            </li>
          ))}
        </ul>
        <p className="text-gray-600 mt-4">
          To make a request, contact us using the details below.
        </p>
      </>
    ),
  },
  {
    id: "account-deletion",
    title: "8. Account Deletion",
    content: (
      <>
        <p className="text-gray-600 mb-3">
          You may request deletion of your Riderr account by contacting us at:
        </p>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 inline-block">
          <p className="text-[#1E5FD8] font-medium">contact@riderr.ng</p>
        </div>
        <p className="text-gray-600 mt-4">
          When you request account deletion, we will review and process the request in accordance with applicable law. Some information may need to be retained for legal, security, or financial record purposes.
        </p>
      </>
    ),
  },
  {
    id: "childrens-privacy",
    title: "9. Children's Privacy",
    content: (
      <p className="text-gray-600">
        Riderr is not intended for children under the age of 13, or any higher minimum age required by applicable law. We do not knowingly collect personal information from children without appropriate authorization. If you believe a child has provided us with personal information, please contact us.
      </p>
    ),
  },
  {
    id: "third-party",
    title: "10. Third-Party Services",
    content: (
      <p className="text-gray-600">
        Riderr may use third-party services to support features such as maps, payments, hosting, analytics, and notifications. These services may have their own privacy policies. We encourage you to review their policies when using their services.
      </p>
    ),
  },
  {
    id: "policy-changes",
    title: "11. Changes to This Privacy Policy",
    content: (
      <p className="text-gray-600">
        We may update this Privacy Policy from time to time. When we make changes, we will update the &quot;Last Updated&quot; date and may notify users when appropriate. We encourage you to review this policy regularly.
      </p>
    ),
  },
  {
    id: "contact",
    title: "12. Contact Us",
    content: (
      <>
        <p className="text-gray-600 mb-4">
          If you have any questions, concerns, or requests about this Privacy Policy, please contact us:
        </p>
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-2 text-sm text-gray-700">
          <p><span className="font-semibold">Company:</span> Riderr</p>
          <p><span className="font-semibold">Email:</span> contact@riderr.ng</p>
          <p><span className="font-semibold">Location:</span> Nigeria</p>
        </div>
      </>
    ),
  },
];

export default function PrivacyPolicy() {
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-blue-200 text-sm font-medium uppercase tracking-wider">Legal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Privacy Policy</h1>
          <p className="text-blue-200 text-sm">Last Updated: June 2025</p>
          <p className="text-blue-100 mt-4 max-w-2xl leading-relaxed">
            Riderr is a logistics technology platform that connects customers with riders and logistics companies. This policy explains how we collect, use, store, and protect your personal information.
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
                We are committed to protecting your privacy and building a trusted logistics platform.
              </p>
              <div className="flex items-center justify-center gap-6 mt-4 text-sm">
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
