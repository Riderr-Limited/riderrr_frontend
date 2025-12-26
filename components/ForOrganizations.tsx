"use client";

import Image from "next/image";

const orgFeatures = [
  {
    title: "Manage Riders at Scale",
    description:
      "Register, verify, and manage all your riders from a single dashboard. Track availability, performance, and delivery history in real time.",
    image: "/org-riders.png",
  },
  {
    title: "Real-Time Delivery Insights",
    description:
      "Monitor active deliveries, completed orders, and rider locations with live updates that help you make faster operational decisions.",
    image: "/org-tracking.png",
  },
  {
    title: "Increase Revenue Opportunities",
    description:
      "Get access to more delivery requests from users on the platform and maximize rider utilization without additional marketing costs.",
    image: "/org-growth.png",
  },
];

export default function ForOrganizations() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Built for Logistics Organizations
          </h2>
          <p className="text-gray-600 text-lg">
            Powerful tools to help logistics companies manage riders, optimize
            operations, and grow revenue—all from one platform.
          </p>
        </div>

        {/* Alternating Rows */}
        <div className="space-y-24">
          {orgFeatures.map((item, index) => (
            <div
              key={item.title}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            >
              {/* Image */}
              <div
                className={`${index % 2 === 0 ? "lg:order-1" : "lg:order-2"}`}
              >
                <div className="rounded-3xl overflow-hidden shadow-lg border">
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
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  {item.description}
                </p>

                <ul className="space-y-3 text-gray-700">
                  <li>✔ Centralized rider management</li>
                  <li>✔ Live tracking & performance metrics</li>
                  <li>✔ Seamless onboarding & operations</li>
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
