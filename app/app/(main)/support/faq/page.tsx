import { PageHeader } from "@/components/dashboard/primitives";
import { BackLink } from "@/components/app/BackLink";

export const metadata = { title: "FAQs" };

// Same content as the mobile app's FAQ screen, with contact details matching the Support page.
const FAQ = [
  {
    category: "General",
    items: [
      {
        q: "How do I create an account?",
        a: "Select Create an account, enter your details and verify your email with the code we send you. The same account works in the mobile app.",
      },
      {
        q: "Is my personal information secure?",
        a: "Yes. We use industry-standard encryption to protect your data and never share it with third parties.",
      },
      {
        q: "How do I contact support?",
        a: "Use live chat, email contact@riderr.ng or call +234 902 616 1292.",
      },
    ],
  },
  {
    category: "For customers",
    items: [
      {
        q: "How do I book a delivery?",
        a: "Choose Send a package, enter the pickup and drop-off addresses, add the recipient's number and what you're sending, then confirm the fare.",
      },
      {
        q: "How much does delivery cost?",
        a: "It depends on distance and the package. You always see the exact fare before you confirm.",
      },
      {
        q: "Can I track my delivery?",
        a: "Yes. Open the delivery from the Deliveries tab to follow it live on the map and message or call your rider.",
      },
      {
        q: "What if my package is damaged?",
        a: "Report it straight away from Support → Report an issue. We'll investigate and compensate you where applicable.",
      },
    ],
  },
  {
    category: "For riders",
    items: [
      {
        q: "How do I start earning?",
        a: "Once your company has set up and verified your profile, go online and start accepting delivery requests.",
      },
      {
        q: "When do I get paid?",
        a: "Earnings are paid weekly, every Monday, for the previous week's deliveries.",
      },
      {
        q: "What if I can't find the customer?",
        a: "Call or message the customer first. If you still can't reach them, use Need help on the delivery screen.",
      },
      {
        q: "Can I work part-time?",
        a: "Yes. Go online or offline whenever you like and work the hours that suit you.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <>
      <BackLink href="/app/support" label="Support" />
      <PageHeader title="Frequently asked questions" />
      <div className="space-y-8">
        {FAQ.map((group) => (
          <section key={group.category}>
            <h2 className="mb-3 text-sm font-semibold">{group.category}</h2>
            <div className="divide-y divide-brand-hairline overflow-hidden rounded-lg border border-brand-hairline">
              {group.items.map((item) => (
                <details key={item.q} className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3.5 text-sm font-medium hover:bg-brand-canvas-soft/60 [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <span aria-hidden className="text-brand-ink-faint transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="px-4 pb-4 text-sm leading-6 text-brand-ink-secondary">{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
