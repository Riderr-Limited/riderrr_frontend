
"use client";

import {
  FaPhoneAlt,
  FaWhatsapp,
  FaEnvelope,
  FaQuestionCircle,
} from "react-icons/fa";

const faqs = [
  {
    question: "How do I register my riders on Riderr?",
    answer:
      "Go to the 'Riders' section in your dashboard, click 'Add Rider', fill in their details, and submit for verification.",
  },
  {
    question: "How do I track deliveries in real-time?",
    answer:
      "Use the 'Active Deliveries' tab in your dashboard. You can see live location updates and status of each delivery.",
  },
  {
    question: "How do I update my company information?",
    answer:
      "Navigate to the 'Profile' or 'Settings' page to edit company info, contact details, and operating areas.",
  },
  {
    question: "How do I get support or report issues?",
    answer:
      "You can contact our support team via email, WhatsApp, or phone. Details are provided below.",
  },
];

export default function HelpPage() {
  return (
    <section className="py-20 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        <h1 className="text-4xl font-bold text-center mb-12">Help & Support</h1>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto space-y-6 mb-16">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white border rounded-2xl p-6 shadow">
              <div className="flex items-center gap-3 mb-2">
                <FaQuestionCircle className="text-brand-600" />
                <h3 className="font-semibold text-lg">{faq.question}</h3>
              </div>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>

        {/* Contact Options */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Need More Help?</h2>
          <p className="text-gray-600 mb-8">
            Reach out to our support team via any of the channels below.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <ContactCard
              icon={<FaPhoneAlt color="#337BFF" />}
              title="Call Us"
              info="+234 800 000 0000"
              link="tel:+2349026161292"
            />
            <ContactCard
              icon={<FaWhatsapp color="#337BFF" />}
              title="WhatsApp"
              info="Chat with our support team"
              link="https://wa.me/2349043238328"
            />
            <ContactCard
              icon={<FaEnvelope color="#337BFF" />}
              title="Email"
              info="support@riderr.app"
              link="mailto:support@riderr.app"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactCard({
  icon,
  title,
  info,
  link,
}: {
  icon: React.ReactNode;
  title: string;
  info: string;
  link: string;
}) {
  return (
    <a
      href={link}
      target="_blank"
      className="bg-white border rounded-2xl p-6 flex flex-col items-center gap-3 hover:shadow-lg transition"
    >
      <div className="w-16 h-16 bg-brand-600 text-white rounded-full flex items-center justify-center text-2xl">
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-gray-600 text-center">{info}</p>
    </a>
  );
}
