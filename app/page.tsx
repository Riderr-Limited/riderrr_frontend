// app/page.tsx
// import { AppleCardsCarouselDemo } from "@/components/AppleCardsCarouselDemo";
import { DownloadCTA } from "@/components/DownloadCTA";
import { FAQ } from "@/components/FAQ";
import FeatureCard from "@/components/FeatureCard";
import { Features } from "@/components/Features";
import ForOrganizations from "@/components/ForOrganizations";
import HeroSectionOne from "@/components/hero-section-demo-1";
import { ImagesSliderDemo } from "@/components/ImagesSliderDemo";
import CallToAction from "@/components/layout/CallToAction";
import ContactUs from "@/components/layout/ContactUs";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/navbar";
import { PartnerCTA } from "@/components/PartnerCTA";
import { Stats } from "@/components/Stats";
import { WhoItsFor } from "@/components/WhoItsFor";


export default function Landing() {
  return (
    <div className="space-y-12">
      <Navbar />
      <HeroSectionOne />
      <ForOrganizations />
      <PartnerCTA />
      <Features />
      <WhoItsFor />
      <Stats />
      <CallToAction />
      <FAQ />
      <ContactUs />
      <Footer />
    </div>
  );
}
