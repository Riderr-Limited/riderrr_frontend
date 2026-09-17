import Link from "next/link";

const sections = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    content: (
      <p className="text-gray-600">
        By downloading, installing, accessing, or using the Riderr mobile application, website, or any related services (collectively, the &quot;Services&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, you must not use our Services. These Terms constitute a legally binding agreement between you and Riderr.
      </p>
    ),
  },
  {
    id: "eligibility",
    title: "2. Eligibility",
    content: (
      <>
        <p className="text-gray-600 mb-3">To use Riderr, you must:</p>
        <ul className="space-y-2">
          {[
            "Be at least 18 years of age, or the age of majority in your jurisdiction.",
            "Have the legal capacity to enter into a binding agreement.",
            "Not be prohibited from using our Services under applicable law.",
            "Provide accurate, complete, and current registration information.",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-gray-600">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#1E5FD8] shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: "description",
    title: "3. Description of Services",
    content: (
      <>
        <p className="text-gray-600 mb-4">
          Riderr is a logistics technology platform that facilitates connections between:
        </p>
        <div className="space-y-3">
          {[
            {
              heading: "Customers",
              body: "Individuals or businesses who request delivery or errand services through the platform.",
            },
            {
              heading: "Riders",
              body: "Independent dispatch riders who accept and fulfil delivery jobs assigned through the platform.",
            },
            {
              heading: "Logistics Companies",
              body: "Registered logistics businesses that manage fleets of riders and handle delivery operations via the Riderr platform.",
            },
          ].map(({ heading, body }) => (
            <div key={heading} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-1">{heading}</h3>
              <p className="text-gray-600 text-sm">{body}</p>
            </div>
          ))}
        </div>
        <p className="text-gray-600 mt-4">
          Riderr acts as a technology intermediary and is not itself a logistics or delivery company. We do not employ riders directly.
        </p>
      </>
    ),
  },
  {
    id: "accounts",
    title: "4. User Accounts",
    content: (
      <>
        <p className="text-gray-600 mb-3">When you create an account on Riderr, you agree to:</p>
        <ul className="space-y-2 mb-4">
          {[
            "Provide accurate and truthful registration information.",
            "Keep your login credentials confidential and secure.",
            "Notify us immediately of any unauthorized access to your account.",
            "Be responsible for all activity that occurs under your account.",
            "Not create multiple accounts or share your account with others.",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-gray-600">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#1E5FD8] shrink-0" />
              {item}
            </li>
          ))}
        </ul>
        <p className="text-gray-600">
          We reserve the right to suspend or terminate accounts that violate these Terms or that we reasonably believe are being used fraudulently.
        </p>
      </>
    ),
  },
  {
    id: "user-conduct",
    title: "5. User Conduct",
    content: (
      <>
        <p className="text-gray-600 mb-3">You agree not to use Riderr to:</p>
        <ul className="space-y-2">
          {[
            "Violate any applicable local, national, or international law or regulation.",
            "Provide false, misleading, or fraudulent information.",
            "Harass, abuse, threaten, or harm other users, riders, or Riderr staff.",
            "Attempt to gain unauthorized access to any part of the platform.",
            "Interfere with or disrupt the integrity or performance of the Services.",
            "Use the platform for any unlawful, harmful, or prohibited purpose.",
            "Transmit any viruses, malware, or other harmful code.",
            "Reverse engineer, decompile, or attempt to extract the source code of the platform.",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-gray-600">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#1E5FD8] shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: "deliveries",
    title: "6. Delivery Services",
    content: (
      <>
        <p className="text-gray-600 mb-4">
          When you request a delivery through Riderr, you acknowledge and agree that:
        </p>
        <ul className="space-y-2 mb-4">
          {[
            "You are responsible for ensuring the accuracy of pickup and delivery addresses.",
            "You must not request delivery of prohibited, illegal, or dangerous items.",
            "Riderr and riders reserve the right to refuse delivery of suspicious or prohibited items.",
            "Delivery timeframes are estimates and may be affected by factors outside our control.",
            "You are responsible for ensuring someone is available to receive the delivery.",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-gray-600">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#1E5FD8] shrink-0" />
              {item}
            </li>
          ))}
        </ul>
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
          <p className="text-amber-800 text-sm font-medium">Prohibited Items</p>
          <p className="text-amber-700 text-sm mt-1">
            You must not use Riderr to send illegal substances, weapons, counterfeit goods, hazardous materials, or any items prohibited by Nigerian law or applicable regulations.
          </p>
        </div>
      </>
    ),
  },
  {
    id: "payments",
    title: "7. Payments and Fees",
    content: (
      <>
        <p className="text-gray-600 mb-3">
          Fees for delivery services are displayed before you confirm a request. By confirming, you agree to pay the stated fee. Additional charges may apply for:
        </p>
        <ul className="space-y-2 mb-4">
          {[
            "Failed delivery attempts due to incorrect address or unavailable recipient.",
            "Waiting time beyond a reasonable threshold.",
            "Additional distance or route changes requested after pickup.",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-gray-600">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#1E5FD8] shrink-0" />
              {item}
            </li>
          ))}
        </ul>
        <p className="text-gray-600">
          Payments are processed through third-party payment providers. Riderr does not store full card details on its servers. All transactions are subject to the terms of the applicable payment provider.
        </p>
      </>
    ),
  },
  {
    id: "intellectual-property",
    title: "8. Intellectual Property",
    content: (
      <p className="text-gray-600">
        All content, trademarks, logos, software, and materials on the Riderr platform are the property of Riderr or its licensors and are protected by applicable intellectual property laws. You may not copy, reproduce, distribute, modify, or create derivative works from any part of the platform without our prior written consent.
      </p>
    ),
  },
  {
    id: "disclaimer",
    title: "9. Disclaimer of Warranties",
    content: (
      <p className="text-gray-600">
        The Riderr platform and Services are provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind, either express or implied. We do not warrant that the Services will be uninterrupted, error-free, or free of viruses or other harmful components. We make no guarantees regarding the reliability, accuracy, or availability of the platform at any given time.
      </p>
    ),
  },
  {
    id: "liability",
    title: "10. Limitation of Liability",
    content: (
      <>
        <p className="text-gray-600 mb-4">
          To the fullest extent permitted by applicable law, Riderr shall not be liable for:
        </p>
        <ul className="space-y-2 mb-4">
          {[
            "Any indirect, incidental, special, or consequential damages.",
            "Loss of profits, data, goodwill, or business opportunities.",
            "Damages arising from the actions or omissions of riders or logistics companies.",
            "Delays, failures, or errors caused by third-party services or infrastructure.",
            "Any loss or damage to parcels or goods during delivery.",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-gray-600">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#1E5FD8] shrink-0" />
              {item}
            </li>
          ))}
        </ul>
        <p className="text-gray-600">
          Where liability cannot be excluded by law, our total liability to you shall not exceed the amount paid by you for the specific delivery that gave rise to the claim.
        </p>
      </>
    ),
  },
  {
    id: "indemnification",
    title: "11. Indemnification",
    content: (
      <p className="text-gray-600">
        You agree to indemnify, defend, and hold harmless Riderr, its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses (including legal fees) arising out of or in connection with your use of the Services, your violation of these Terms, or your violation of any rights of another party.
      </p>
    ),
  },
  {
    id: "termination",
    title: "12. Termination",
    content: (
      <p className="text-gray-600">
        We reserve the right to suspend or terminate your access to Riderr at any time, with or without notice, if we believe you have violated these Terms or if we determine it is necessary to protect the safety, security, or integrity of the platform. You may also terminate your account at any time by contacting us. Termination does not affect any rights or obligations that arose prior to termination.
      </p>
    ),
  },
  {
    id: "governing-law",
    title: "13. Governing Law",
    content: (
      <p className="text-gray-600">
        These Terms are governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any disputes arising from or relating to these Terms or the use of Riderr shall be subject to the exclusive jurisdiction of the courts of Nigeria.
      </p>
    ),
  },
  {
    id: "changes",
    title: "14. Changes to These Terms",
    content: (
      <p className="text-gray-600">
        We may update these Terms from time to time. When we do, we will update the &quot;Last Updated&quot; date and may notify you through the app or by email. Your continued use of Riderr after changes are posted constitutes your acceptance of the updated Terms. We encourage you to review these Terms regularly.
      </p>
    ),
  },
  {
    id: "contact",
    title: "15. Contact Us",
    content: (
      <>
        <p className="text-gray-600 mb-4">
          If you have any questions or concerns about these Terms, please contact us:
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

export default function TermsOfService() {
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="text-blue-200 text-sm font-medium uppercase tracking-wider">Legal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Terms of Service</h1>
          <p className="text-blue-200 text-sm">Last Updated: June 2025</p>
          <p className="text-blue-100 mt-4 max-w-2xl leading-relaxed">
            Please read these Terms carefully before using Riderr. By accessing or using our platform, you agree to be bound by these Terms.
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
                By using Riderr, you acknowledge that you have read, understood, and agree to these Terms of Service.
              </p>
              <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                <Link href="/privacy-policy" className="text-[#1E5FD8] hover:underline">
                  Privacy Policy
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
