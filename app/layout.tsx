import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { FloatingIslandNav } from "@/components/layout/floating-island-nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hyperion Fabric Ops",
  description:
    "HPC work orders, technician routing, and automation for NVIDIA-powered fabrics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <FloatingIslandNav
          links={[
            { label: "Overview", href: "/" },
            { label: "Tickets", href: "/tickets" },
            { label: "Field Ops", href: "/field-ops" },
            { label: "Floor Plan", href: "/floor-plan" },
            { label: "Inventory", href: "/inventory" },
          ]}
        />
        <div className="pt-24">{children}</div>
      </body>
    </html>
  );
}
