// app/page.tsx
import FeatureCard from "@/components/FeatureCard";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function Landing() {
  return (
    <div className="space-y-12">
      <section className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-4xl font-extrabold mb-4">
            Run deliveries & riders from one platform
          </h1>
          <p className="text-lg text-slate-600 mb-6">
            Register your business, manage riders, assign deliveries and track
            your revenue — all from a single dashboard tailored for restaurants,
            retail, logistics and more.
          </p>
          <div className="flex gap-3">
            <Link href="/onboarding">
              <Button className="bg-indigo-600 text-white hover:bg-indigo-700">
                Get Started
              </Button>
            </Link>
            <a
              href="#features"
              className="inline-flex items-center px-4 py-2 border rounded"
            >
              Learn more
            </a>
          </div>
          <div className="mt-6 text-sm text-slate-500">
            Trusted by dozens of businesses across the country.
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="font-semibold mb-3">Quick overview</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>Multi-step Organization registration & verification</li>
            <li>Rider management: add, suspend, QR login, SMS credentials</li>
            <li>Delivery assignment with auto-assign and manual assign</li>
            <li>Revenue and Delivery Analytics — exportable reports</li>
          </ul>
        </div>
      </section>

      <section id="features" className="grid md:grid-cols-3 gap-6">
        <FeatureCard
          title="Rider Management"
          description="Add riders, upload documents, view performance & earnings."
        />
        <FeatureCard
          title="Delivery Assignment"
          description="Assign deliveries manually or auto-assign nearest rider."
        />
        <FeatureCard
          title="Analytics & Exports"
          description="Revenue charts, top routes, CSV / PDF exports."
        />
      </section>

      <section className="py-8">
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-2xl font-semibold mb-2">
            Ready to onboard your business?
          </h2>
          <p className="text-slate-600 mb-4">
            Create an organization account and start adding riders in minutes.
          </p>
          <Link href="/onboarding">
            <Button className="bg-green-600 text-white">
              Create Organization Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
