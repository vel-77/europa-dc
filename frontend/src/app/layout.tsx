import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Self-hosted (latin subsets from Google Fonts) so builds never depend on a download.
const cormorant = localFont({
  variable: "--font-cormorant",
  src: [
    { path: "../fonts/CormorantGaramond-normal-300-700.woff2", weight: "300 700", style: "normal" },
    { path: "../fonts/CormorantGaramond-italic-300-700.woff2", weight: "300 700", style: "italic" },
  ],
});
const manrope = localFont({
  variable: "--font-manrope",
  src: [{ path: "../fonts/Manrope-normal-200-800.woff2", weight: "200 800", style: "normal" }],
});

export const metadata: Metadata = {
  title: "Europa Design Center | Kitchens, Bathrooms, Surfaces & Interiors",
  description:
    "Europa DC designs and installs European kitchens, bathrooms, closets, and complete interiors. Custom cabinetry, Dekton surfaces, fixtures, and architectural details from one showroom in Glendale, California.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-scroll-behavior: the page scrolls smoothly to in-page links, but Next
    // turns that off while changing pages so a new page opens at the top.
    <html lang="en" className={`${cormorant.variable} ${manrope.variable}`} data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
