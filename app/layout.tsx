import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ToastProvider";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "Riderr - Fast, Reliable Logistics Simplified",
  description:
    "Connect with nearby riders instantly for fast, affordable deliveries. Riderr is the all-in-one platform connecting customers, riders, and logistics companies for seamless delivery management.",
  keywords: [
    "delivery service",
    "logistics platform",
    "rider matching",
    "real-time tracking",
    "on-demand delivery",
    "package delivery",
    "courier service",
    "delivery app",
  ],
  authors: [{ name: "Riderr" }],
  openGraph: {
    title: "Riderr - Fast, Reliable Logistics Simplified",
    description:
      "Connect with nearby riders instantly for fast, affordable deliveries. Real-time tracking, transparent pricing, and verified riders.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Riderr - Fast, Reliable Logistics Simplified",
    description:
      "Connect with nearby riders instantly for fast, affordable deliveries.",
  },
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          async
          defer
          src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places"
        ></script>
      </head>
      <body
        className="font-sans antialiased"
      >
        <AuthProvider>
          <ToastProvider>
            <main className="">{children}</main>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
