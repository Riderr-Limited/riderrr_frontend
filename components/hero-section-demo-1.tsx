import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/20 via-transparent to-yellow-100/20"></div>
      <div className="absolute top-20 right-20 w-72 h-72 bg-blue-200/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-yellow-200/10 rounded-full blur-3xl"></div>
      
      <div className="relative mx-auto max-w-4xl px-6 pt-32 pb-20">
        <div className="flex flex-col items-center text-center min-h-[80vh] justify-center space-y-12">

          {/* MAIN CONTENT */}
          <div className="space-y-8">
            {/* <div className="inline-flex items-center px-6 py-3 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              🚀 Revolutionizing Logistics
            </div> */}
            
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
              platform — enabling instant delivery requests, smart rider
              matching, and real-time operations.
            </p>
          </div>

          {/* STORE BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-6 pt-8">
            <div className="transform hover:scale-105 transition-transform duration-200">
              <Image
                src="/app-store.svg"
                alt="Download on App Store"
                width={200}
                height={60}
                priority
                className="drop-shadow-lg"
              />
            </div>
            <div className="transform hover:scale-105 transition-transform duration-200">
              <Image
                src="/google-play.svg"
                alt="Download on Play Store"
                width={200}
                height={60}
                priority
                className="drop-shadow-lg"
              />
            </div>
          </div>

          {/* FEATURE HIGHLIGHTS */}
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16 max-w-4xl">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="font-bold text-gray-900">Instant Matching</h3>
              <p className="text-gray-600 text-sm">Smart algorithms connect you with the nearest available rider</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">📍</span>
              </div>
              <h3 className="font-bold text-gray-900">Real-time Tracking</h3>
              <p className="text-gray-600 text-sm">Track your deliveries live with precise location updates</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="font-bold text-gray-900">Secure & Reliable</h3>
              <p className="text-gray-600 text-sm">End-to-end security with verified riders and safe payments</p>
            </div>
          </div> */}

        </div>
      </div>
    </section>
  );
}
