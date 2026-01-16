import Image from "next/image";

export default function Hero() {
  return (
    <section className="pt-28 pb-24 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

        {/* LEFT CONTENT */}
        <div className="lg:col-span-6">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-[#1E5FD8]">
            FAST.
            <br />
            RELIABLE.
            <br />
            <span className="block md:whitespace-nowrap">
              LOGISTICS{" "}
              <span className="text-yellow-400">SIMPLIFIED</span>
            </span>
          </h1>

          <p className="mt-6 text-neutral-600 max-w-md">
            Riderr connects customers, riders, and logistics companies on one
            platform — enabling instant delivery requests, smart rider
            matching, and real-time operations.
          </p>

          {/* STORE BUTTONS */}
          <div className="mt-8 flex gap-4">
            <Image
              src="/app-store.svg"
              alt="Download on App Store"
              width={160}
              height={48}
              priority
            />
            <Image
              src="/google-play.svg"
              alt="Download on Play Store"
              width={160}
              height={48}
              priority
            />
          </div>
        </div>

        {/* RIGHT APP PREVIEW */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="relative w-[300px] h-[540px] overflow-hidden rounded-t-[32px] shadow-2xl lg:ml-8">
            <Image
              src="/home page.png"
              alt="Riderr App Preview"
              fill
              className="object-cover object-top"
              priority
            />
          </div>
        </div>

      </div>
    </section>
  );
}
