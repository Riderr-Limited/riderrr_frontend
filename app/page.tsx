// app/page.tsx
import { AppleCardsCarouselDemo } from "@/components/AppleCardsCarouselDemo";
import { FAQ } from "@/components/FAQ";
import FeatureCard from "@/components/FeatureCard";
import ForOrganizations from "@/components/ForOrganizations";
import HeroSectionOne from "@/components/hero-section-demo-1";
import { ImagesSliderDemo } from "@/components/ImagesSliderDemo";
import CallToAction from "@/components/layout/CallToAction";
import ContactUs from "@/components/layout/ContactUs";
import Footer from "@/components/layout/Footer";
import { Stats } from "@/components/Stats";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

const testimonials = [
  {
    quote:
      "The attention to detail and innovative features have completely transformed our workflow. This is exactly what we've been looking for.",
    name: "Sarah Chen",
    designation: "Product Manager at TechFlow",
    src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=3560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    quote:
      "Implementation was seamless and the results exceeded our expectations. The platform's flexibility is remarkable.",
    name: "Michael Rodriguez",
    designation: "CTO at InnovateSphere",
    src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    quote:
      "This solution has significantly improved our team's productivity. The intuitive interface makes complex tasks simple.",
    name: "Emily Watson",
    designation: "Operations Director at CloudScale",
    src: "https://images.unsplash.com/photo-1623582854588-d60de57fa33f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    quote:
      "Outstanding support and robust features. It's rare to find a product that delivers on all its promises.",
    name: "James Kim",
    designation: "Engineering Lead at DataPro",
    src: "https://images.unsplash.com/photo-1636041293178-808a6762ab39?q=80&w=3464&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    quote:
      "The scalability and performance have been game-changing for our organization. Highly recommend to any growing business.",
    name: "Lisa Thompson",
    designation: "VP of Technology at FutureNet",
    src: "https://images.unsplash.com/photo-1624561172888-ac93c696e10c?q=80&w=2592&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

export default function Landing() {
  return (
    <div className="space-y-12">
      <HeroSectionOne />
      <ImagesSliderDemo />
      <AppleCardsCarouselDemo />
      <ForOrganizations />
      {/* <AnimatedTestimonials testimonials={testimonials} /> */}

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
      <Stats />
      <CallToAction />
      <FAQ />
      <ContactUs />
      <Footer />
    </div>
  );
}
