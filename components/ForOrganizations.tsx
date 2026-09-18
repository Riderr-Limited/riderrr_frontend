"use client";

import Image from "next/image";

const orgFeatures = [
  {
    title: "Manage Riders at Scale",
    description:
      "Register, verify, and manage all your riders from a single dashboard. Track availability, performance, and delivery history in real time.",
    image: "/4.jpeg",
  },
  {
    title: "Real-Time Delivery Insights",
    description:
      "Monitor active deliveries, completed orders, and rider locations with live updates that help you make faster operational decisions.",
    image: "/3.jpeg",
  },
  {
    title: "Increase Revenue Opportunities",
    description:
      "Get access to more delivery requests from users on the platform and maximize rider utilization without additional marketing costs.",
    image: "/3.jpeg",
  },
];

const checklist = [
  "Centralized rider management",
  "Live tracking & performance metrics",
  "Seamless onboarding & operations",
];

export default function ForOrganizations() {
  return (
    <section id="organizations" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-5 tracking-[-0.02em] text-brand-ink">
            Built for{" "}
            <span className="text-brand-primary">
              logistics organizations
            </span>
          </h2>
          <p className="text-lg text-brand-ink-muted leading-relaxed max-w-3xl mx-auto">
            Powerful tools to help logistics companies manage riders, optimize
            operations, and grow revenue—all from one platform.
          </p>
        </div>

        {/* Features Grid */}
        <div className="space-y-16">
          {orgFeatures.map((item, index) => (
            <div
              key={item.title}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            >
              {/* Image */}
              <div
                className={`${index % 2 === 0 ? "lg:order-1" : "lg:order-2"}`}
              >
                <div className="rounded-xl overflow-hidden border border-brand-hairline shadow-soft">
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={600}
                    height={400}
                    className="object-cover w-full"
                  />
                </div>
              </div>

              {/* Text */}
              <div
                className={`${index % 2 === 0 ? "lg:order-2" : "lg:order-1"}`}
              >
                <h3 className="text-2xl md:text-3xl font-bold mb-3 tracking-[-0.01em] text-brand-ink">
                  {item.title}
                </h3>
                <p className="text-base leading-relaxed mb-5 text-brand-ink-muted">
                  {item.description}
                </p>

                <ul className="space-y-3">
                  {checklist.map((label) => (
                    <li key={label} className="flex items-center text-brand-ink-secondary">
                      <div className="w-5 h-5 bg-brand-primary rounded-full flex items-center justify-center mr-3 shrink-0">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      {label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
