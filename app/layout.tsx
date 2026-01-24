import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ToastProvider";
import { AuthProvider } from "@/contexts/AuthContext";

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
