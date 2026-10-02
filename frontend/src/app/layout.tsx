import type { Metadata } from "next";
import { Architects_Daughter, Jost } from "next/font/google";
import "./globals.css";

const jost = Jost({ variable: "--font-jost", subsets: ["latin"] });
// Only used for the hand-written notes inside the kitchen sketch.
const hand = Architects_Daughter({ variable: "--font-hand", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "Europa Design Center | Kitchens, baths and closets in Glendale, CA",
  description:
    "Europa DC designs, supplies and installs European kitchens, baths and closets. Cabinets, stonework, appliances, hardware, doors and plumbing fixtures from one showroom in Glendale.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${jost.variable} ${hand.variable}`}>
      <body>{children}</body>
    </html>
  );
}
