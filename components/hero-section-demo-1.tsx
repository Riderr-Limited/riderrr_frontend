import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative bg-brand-canvas-soft overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-6 pt-40 pb-24">
        <div className="flex flex-col items-center text-center space-y-10">
          {/* MAIN CONTENT */}
          <div className="space-y-6">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.02] tracking-[-0.03em] text-brand-ink">
              Fast, reliable logistics
              <br />
              <span className="text-brand-primary">simplified.</span>
            </h1>

            <p className="text-lg md:text-xl text-brand-ink-muted max-w-2xl leading-relaxed mx-auto">
              Riderr connects customers, riders, and logistics companies on one
              platform enabling instant delivery requests, smart rider matching,
              and real-time operations.
            </p>
          </div>

          {/* CTA BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="#contact"
              className="px-7 py-3.5 bg-brand-primary text-white font-semibold rounded-full hover:bg-brand-primary-active transition-colors duration-200"
            >
              Get Started
            </Link>
            <Link
              href="#how-it-works"
              className="px-7 py-3.5 bg-white border border-brand-hairline text-brand-ink font-semibold rounded-full shadow-soft hover:border-brand-primary/40 transition-colors duration-200"
            >
              Learn More
            </Link>
          </div>

          {/* STORE BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-6 pt-6">
            <div className="transform hover:scale-105 transition-transform duration-200 cursor-pointer">
              <Image
                src="/app-store.svg"
                alt="Download on App Store"
                width={170}
                height={56}
                priority
              />
            </div>
            <div className="transform hover:scale-105 transition-transform duration-200 cursor-pointer">
              <Image
                src="/google-play.svg"
                alt="Download on Play Store"
                width={170}
                height={56}
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
