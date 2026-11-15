import type { Metadata } from "next";
import { AppProviders } from "@/components/app/AppProviders";

export const metadata: Metadata = {
  title: {
    default: "Riderr",
    template: "%s · Riderr",
  },
  description:
    "Send packages, run errands and order pay-on-delivery with Riderr — right from your browser. Riders can go online and take jobs too.",
  robots: { index: false, follow: false },
};

export default function WebAppLayout({ children }: { children: React.ReactNode }) {
  return <AppProviders>{children}</AppProviders>;
}
