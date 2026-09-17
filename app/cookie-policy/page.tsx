import Link from "next/link";

const sections = [
  {
    id: "what-are-cookies",
    title: "1. What Are Cookies",
    content: (
      <p className="text-gray-600">
        Cookies are small text files that are placed on your device (computer, smartphone, or tablet) when you visit a website or use a web-based application. They are widely used to make websites and apps work more efficiently, remember your preferences, and provide information to the owners of the site. Cookies do not contain personally identifiable information on their own, but they may be linked to information we hold about you.
      </p>
    ),
  },
  {
    id: "how-we-use",
    title: "2. How We Use Cookies",
    content: (
      <>
        <p className="text-gray-600 mb-3">Riderr uses cookies and similar tracking technologies to:</p>
        <ul className="space-y-2">
          {[
            "Keep you logged in and maintain your session securely.",
            "Remember your preferences and settings.",
            "Understand how you interact with our platform.",
            "Measure the performance and effectiveness of our features.",
            "Detect and prevent fraud and unauthorized access.",
            "Improve the overall experience of using Riderr.",
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
    id: "types-of-cookies",
    title: "3. Types of Cookies We Use",
    content: (
      <div className="space-y-3">
        {[
          {
            heading: "Essential Cookies",
            badge: "Always Active",
            badgeColor: "bg-green-100 text-green-700",
            body: "These cookies are necessary for the platform to function and cannot be switched off. They are usually set in response to actions you take, such as logging in, filling in forms, or setting your preferences. Without these cookies, core features of Riderr will not work.",
          },
          {
            heading: "Authentication Cookies",
            badge: "Always Active",
            badgeColor: "bg-green-100 text-green-700",
            body: "Used to identify you when you log in and to keep your session active while you use the platform. These ensure your account remains secure during your session.",
          },
          {
            heading: "Preference Cookies",
            badge: "Optional",
            badgeColor: "bg-blue-100 text-blue-700",
            body: "These cookies allow us to remember choices you make, such as your language preference or display settings, so we can provide a more personalised experience.",
          },
          {
            heading: "Analytics Cookies",
            badge: "Optional",
            badgeColor: "bg-blue-100 text-blue-700",
            body: "We may use analytics tools that set cookies to help us understand how users interact with our platform — such as which pages are visited most, how long users stay, and where errors occur. This helps us improve the platform over time. Data collected is aggregated and anonymised where possible.",
          },
          {
            heading: "Security Cookies",
            badge: "Always Active",
            badgeColor: "bg-green-100 text-green-700",
            body: "These cookies support security features, such as detecting suspicious login attempts, preventing cross-site request forgery (CSRF), and protecting against fraud.",
          },
        ].map(({ heading, badge, badgeColor, body }) => (
          <div key={heading} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-gray-900">{heading}</h3>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeColor}`}>
                {badge}
              </span>
            </div>
            <p className="text-gray-600 text-sm">{body}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "similar-technologies",
    title: "4. Similar Technologies",
    content: (
      <>
        <p className="text-gray-600 mb-4">
          In addition to cookies, we may use other similar technologies, including:
        </p>
        <div className="space-y-3">
          {[
            {
              heading: "Local Storage",
              body: "Used to store data locally in your browser to improve performance and maintain state between sessions.",
            },
            {
              heading: "Session Storage",
              body: "Temporary storage that is cleared when you close your browser tab, used to maintain state during a single session.",
            },
            {
              heading: "Pixel Tags / Web Beacons",
              body: "Small invisible images embedded in pages or emails that help us understand user behaviour and measure the effectiveness of communications.",
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
    id: "third-party-cookies",
    title: "5. Third-Party Cookies",
    content: (
      <>
        <p className="text-gray-600 mb-4">
          Some cookies on our platform are set by third-party services we use to support our operations. These may include:
        </p>
        <ul className="space-y-2 mb-4">
          {[
            "Payment providers for processing transactions securely.",
            "Map and location service providers for delivery tracking.",
            "Analytics providers to help us understand platform usage.",
            "Cloud infrastructure providers that support platform performance.",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-gray-600">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#1E5FD8] shrink-0" />
              {item}
            </li>
          ))}
        </ul>
        <p className="text-gray-600">
          These third parties have their own privacy and cookie policies. We encourage you to review their policies when using their services. Riderr does not control the cookies set by third parties.
        </p>
      </>
    ),
  },
  {
    id: "managing-cookies",
    title: "6. Managing and Controlling Cookies",
    content: (
      <>
        <p className="text-gray-600 mb-4">
          You have the right to decide whether to accept or reject optional cookies. You can manage your cookie preferences in the following ways:
        </p>
        <div className="space-y-3 mb-4">
          {[
            {
              heading: "Browser Settings",
              body: "Most web browsers allow you to control cookies through their settings. You can set your browser to refuse cookies, delete existing cookies, or alert you when cookies are being set. Refer to your browser's help documentation for instructions.",
            },
            {
              heading: "Device Settings",
              body: "On mobile devices, you can manage app permissions and tracking preferences through your device's privacy or settings menu.",
            },
            {
              heading: "Opt-Out Tools",
              body: "Some third-party analytics providers offer opt-out mechanisms. Where available, we will provide links to these tools.",
            },
          ].map(({ heading, body }) => (
            <div key={heading} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-1">{heading}</h3>
              <p className="text-gray-600 text-sm">{body}</p>
            </div>
          ))}
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
          <p className="text-amber-800 text-sm font-medium">Please Note</p>
          <p className="text-amber-700 text-sm mt-1">
            Disabling essential or authentication cookies may prevent you from logging in or using core features of the Riderr platform. We recommend keeping essential cookies enabled for the best experience.
          </p>
        </div>
      </>
    ),
  },
  {
    id: "cookie-duration",
    title: "7. Cookie Duration",
    content: (
      <>
        <p className="text-gray-600 mb-4">Cookies we use fall into two duration categories:</p>
        <div className="space-y-3">
          {[
            {
              heading: "Session Cookies",
              body: "These are temporary cookies that expire when you close your browser or end your session. They are used to maintain your login state and other temporary data during your visit.",
            },
            {
              heading: "Persistent Cookies",
              body: "These cookies remain on your device for a set period of time or until you delete them. They are used to remember your preferences and settings across multiple visits.",
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
    id: "policy-changes",
    title: "8. Changes to This Cookie Policy",
    content: (
      <p className="text-gray-600">
        We may update this Cookie Policy from time to time to reflect changes in technology, regulation, or our practices. When we make changes, we will update the &quot;Last Updated&quot; date at the top of this page. We encourage you to review this policy periodically to stay informed about how we use cookies.
      </p>
    ),
  },
  {
    id: "contact",
    title: "9. Contact Us",
    content: (
      <>
        <p className="text-gray-600 mb-4">
          If you have any questions about our use of cookies or this Cookie Policy, please contact us:
        </p>
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-2 text-sm text-gray-700">
          <p><span className="font-semibold">Company:</span> Riderr</p>
          <p><span className="font-semibold">Email:</span> support@riderr.ng</p>
          <p><span className="font-semibold">Location:</span> Nigeria</p>
        </div>
      </>
    ),
  },
];

export default function CookiePolicy() {
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-blue-200 text-sm font-medium uppercase tracking-wider">Legal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Cookie Policy</h1>
          <p className="text-blue-200 text-sm">Last Updated: June 2025</p>
          <p className="text-blue-100 mt-4 max-w-2xl leading-relaxed">
            This Cookie Policy explains how Riderr uses cookies and similar technologies when you use our platform, and how you can manage your preferences.
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
                For more information on how we handle your data, please review our Privacy Policy and Terms of Service.
              </p>
              <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                <Link href="/privacy-policy" className="text-[#1E5FD8] hover:underline">
                  Privacy Policy
                </Link>
                <span className="text-gray-300">|</span>
                <Link href="/terms-of-service" className="text-[#1E5FD8] hover:underline">
                  Terms of Service
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
