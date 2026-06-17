// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Navbar } from "@/components/Navbar";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { DM_Sans } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BlueMind Map the litter, mend the planet",
  description:
    "BlueMind is a community platform to document litter you find in the wild, building an open dataset of pollution while earning eco badges.",
  applicationName: "BlueMind",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "BlueMind" },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#0ea5e9",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={dmSans.className}>
      <body className="min-h-dvh">
        <AuthProvider>
          <Navbar />
          <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4 sm:px-6">
            {children}
          </main>
          <ServiceWorkerRegister />
        </AuthProvider>
      </body>
    </html>
  );
}
