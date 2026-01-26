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
    <section id="organizations" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            Built for{" "}
            <span className="text-blue-500">
              Logistics Organizations
            </span>
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
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
                <div className="rounded-2xl overflow-hidden shadow-lg">
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
                <h3 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                  {item.title}
                </h3>
                <p className="text-lg leading-relaxed mb-6 text-gray-600">
                  {item.description}
                </p>

                <ul className="space-y-3">
                  <li className="flex items-center text-gray-700">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    Centralized rider management
                  </li>
                  <li className="flex items-center text-gray-700">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    Live tracking & performance metrics
                  </li>
                  <li className="flex items-center text-gray-700">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
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
