import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/20 via-transparent to-yellow-100/20"></div>
      <div className="absolute top-20 right-20 w-72 h-72 bg-blue-200/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-yellow-200/10 rounded-full blur-3xl"></div>

      <div className="relative mx-auto max-w-7xl px-6 pt-32 pb-20">
        <div className="flex flex-col items-center text-center min-h-[80vh] justify-center space-y-12">
          {/* MAIN CONTENT */}
          <div className="space-y-8">
            <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tight">
              <span className="bg-gradient-to-r from-[#1E5FD8] to-blue-600 bg-clip-text text-transparent">
                FAST.
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#1E5FD8] to-blue-600 bg-clip-text text-transparent">
                RELIABLE.
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#1E5FD8] to-blue-600 bg-clip-text text-transparent">
                LOGISTICS{" "}
              </span>
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                SIMPLIFIED
              </span>
            </h1>

            <p className="text-xl text-gray-600 max-w-2xl leading-relaxed mx-auto">
              Riderr connects customers, riders, and logistics companies on one
              platform enabling instant delivery requests, smart rider matching,
              and real-time operations.
            </p>
          </div>

          {/* CTA BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              href="#contact"
              className="px-8 py-4 bg-gradient-to-r from-[#1E5FD8] to-blue-600 text-white font-bold rounded-full hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-lg"
            >
              Get Started
            </Link>
            <Link
              href="#how-it-works"
              className="px-8 py-4 bg-white border-2 border-[#1E5FD8] text-[#1E5FD8] font-bold rounded-full hover:bg-[#1E5FD8] hover:text-white hover:scale-105 transition-all duration-300 shadow-lg"
            >
              Learn More
            </Link>
          </div>

          {/* STORE BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-6 pt-4">
            <div className="transform hover:scale-105 transition-transform duration-200 cursor-pointer">
              <Image
                src="/app-store.svg"
                alt="Download on App Store"
                width={180}
                height={60}
                priority
                className="drop-shadow-lg"
              />
            </div>
            <div className="transform hover:scale-105 transition-transform duration-200 cursor-pointer">
              <Image
                src="/google-play.svg"
                alt="Download on Play Store"
                width={180}
                height={60}
                priority
                className="drop-shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
