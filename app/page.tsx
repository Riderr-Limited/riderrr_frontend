// app/page.tsx
import { DownloadCTA } from "@/components/DownloadCTA";
import HowItWorks from "@/components/HowItWorks";
import { FAQ } from "@/components/FAQ";
import { Features } from "@/components/Features";
import ForOrganizations from "@/components/ForOrganizations";
import HeroSectionOne from "@/components/hero-section-demo-1";
import CallToAction from "@/components/layout/CallToAction";
import ContactUs from "@/components/layout/ContactUs";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/navbar";
import { PartnerCTA } from "@/components/PartnerCTA";
import { Stats } from "@/components/Stats";
import { Testimonials } from "@/components/Testimonials";

export default function Landing() {
  return (
    <div>
      <Navbar />
      <HeroSectionOne />
      <Features />
      <HowItWorks />
      <ForOrganizations />
      <PartnerCTA />
      <Stats />
      <Testimonials />
      <FAQ />
      <CallToAction />
      <ContactUs />
      <Footer />
    </div>
  );
}
