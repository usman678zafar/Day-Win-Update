import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AppHeader } from "@/components/AppHeader";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Day Win",
  description: "Habit tracking with squad accountability",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#fafaf9",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full min-h-dvh ${dmSans.variable}`}>
      <body
        className={`${dmSans.className} flex min-h-dvh min-w-0 flex-col bg-gradient-to-b from-stone-50 via-white to-emerald-50/30 text-zinc-900 antialiased`}
      >
        <Providers>
          <AppHeader />
          <main className="min-h-0 min-w-0 flex-1">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
