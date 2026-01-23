import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ToastProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Riderr",
  description:
    "An all-in-one delivery app that connects users to fast, reliable delivery services for packages, food, groceries, and more—anytime, anywhere.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <ToastProvider>
          <main className="">{children}</main>
        </ToastProvider>
      </body>
    </html>
  );
}
