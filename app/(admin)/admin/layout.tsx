import type { Metadata } from "next";
import { DM_Mono, Jost } from "next/font/google";
import "../../globals.css";
import { ThemeInit } from "../../components/ThemeInit";
import { AdminSidebar } from "./AdminSidebar";
import { requireAdmin } from "@/lib/auth/require-admin";

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

export const metadata: Metadata = {
  title: "Admin — DiQualia",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <html
      lang="en"
      className={`${jost.variable} ${dmMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head />
      <body className="min-h-full flex bg-[var(--background)] text-[var(--foreground)]">
        <ThemeInit />
        <AdminSidebar />
        <main className="flex-1 min-h-screen overflow-y-auto p-8">{children}</main>
      </body>
    </html>
  );
}
