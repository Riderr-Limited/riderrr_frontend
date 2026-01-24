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

export default function ForOrganizations() {
  return (
    <section className="py-24 bg-[#1E5FD8]">
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-white leading-tight tracking-tight">
            Built for{" "}
            <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
              Logistics Organizations
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 leading-relaxed font-light max-w-3xl mx-auto">
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
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white leading-tight tracking-tight">
                  {item.title}
                </h3>
                <p className="text-lg md:text-xl leading-relaxed mb-8 text-blue-100 font-light">
                  {item.description}
                </p>

                <ul className="space-y-4 text-white">
                  <li className="flex items-center text-lg font-medium">
                    <span className="text-yellow-300 mr-3 text-xl">✓</span>
                    Centralized rider management
                  </li>
                  <li className="flex items-center text-lg font-medium">
                    <span className="text-yellow-300 mr-3 text-xl">✓</span>
                    Live tracking & performance metrics
                  </li>
                  <li className="flex items-center text-lg font-medium">
                    <span className="text-yellow-300 mr-3 text-xl">✓</span>
                    Seamless onboarding & operations
                  </li>
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
