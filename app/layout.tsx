import type { Metadata, Viewport } from "next";
import { DM_Mono, Jost, Playfair_Display } from "next/font/google";
import "./globals.css";
import { StructuredData } from "./components/StructuredData";
import { ThemeReconciler } from "./components/ThemeReconciler";
import { ThemeScript } from "./components/ThemeScript";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site-config";
import { buildOrganizationSchema, buildWebsiteSchema } from "@/lib/structured-data";

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

const TITLE_DEFAULT = "DiQualia — Marketing Intelligence & Research";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE_DEFAULT,
    template: "%s — DiQualia",
  },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  // Icons resolve from the app/ file conventions: icon.svg (primary), favicon.ico, apple-icon.png.
  // OG/Twitter images resolve from app/opengraph-image.tsx + app/twitter-image.tsx.
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    url: "/",
    title: TITLE_DEFAULT,
    description:
      "Marketing intelligence and research for niche B2B companies — deep sector immersion, buyer mapping, and precision go-to-market execution.",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE_DEFAULT,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f6f0" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0b0d" },
  ],
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
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeReconciler />
        <StructuredData data={[buildOrganizationSchema(), buildWebsiteSchema()]} />
        {children}
      </body>
    </html>
  );
}
