"use client";

import {
  IconPhone,
  IconBrandWhatsapp,
  IconMail,
} from "@tabler/icons-react";
import { PageHeader } from "@/components/dashboard/primitives";

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
    <div className="max-w-3xl">
      <PageHeader
        title="Help & Support"
        description="Answers to common questions and ways to reach us."
      />

      {/* FAQ Section */}
      <section className="dash-card divide-y divide-brand-hairline">
        {faqs.map((faq, index) => (
          <div key={index} className="px-5 py-4">
            <h3 className="text-sm font-medium text-brand-ink">{faq.question}</h3>
            <p className="mt-1 text-sm leading-6 text-brand-ink-muted">{faq.answer}</p>
          </div>
        ))}
      </section>

      {/* Contact Options */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold text-brand-ink">Need more help?</h2>
        <p className="mt-0.5 text-sm text-brand-ink-muted">
          Reach out to our support team via any of the channels below.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <ContactCard
            icon={<IconPhone className="size-[18px]" stroke={1.75} />}
            title="Call Us"
            info="+234 800 000 0000"
            link="tel:+2349026161292"
          />
          <ContactCard
            icon={<IconBrandWhatsapp className="size-[18px]" stroke={1.75} />}
            title="WhatsApp"
            info="Chat with our support team"
            link="https://wa.me/2349043238328"
          />
          <ContactCard
            icon={<IconMail className="size-[18px]" stroke={1.75} />}
            title="Email"
            info="support@riderr.app"
            link="mailto:support@riderr.app"
          />
        </div>
      </section>
    </div>
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
      className="dash-card block px-4 py-3.5 transition-colors hover:bg-brand-canvas-soft"
    >
      <span className="text-brand-ink-muted">{icon}</span>
      <h3 className="mt-2.5 text-sm font-medium text-brand-ink">{title}</h3>
      <p className="mt-0.5 text-[13px] text-brand-ink-muted">{info}</p>
    </a>
  );
}
