import type { Metadata } from "next";
import { DM_Mono, Jost, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeInit } from "./components/ThemeInit";

const jost = Jost({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500"],
});

const dmMono = DM_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "DiQualia — Marketing Intelligence & Research",
  description:
    "DiQualia is a marketing intelligence and research unit for niche B2B companies — research-first strategy, buyer mapping, and precision pipeline growth.",
  // Icons resolve from the app/ file conventions: icon.svg (primary), favicon.ico, apple-icon.png.
  openGraph: {
    title: "DiQualia — Marketing Intelligence & Research",
    description:
      "Marketing intelligence and research for niche B2B companies — deep sector immersion, buyer mapping, and precision go-to-market execution.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jost.variable} ${dmMono.variable} ${playfair.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head />
      <body className="min-h-full flex flex-col">
        <ThemeInit />
        {children}
      </body>
    </html>
  );
}
