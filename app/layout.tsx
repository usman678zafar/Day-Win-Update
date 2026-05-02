import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AppHeader } from "@/components/AppHeader";
import { ThemeHydrationSync } from "@/components/ThemeHydrationSync";
import { ThemeInitScript } from "@/components/ThemeInitScript";

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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" },
    { media: "(prefers-color-scheme: dark)", color: "#262626" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full min-h-dvh dark:bg-[#262626]">
      <body
        className={`${dmSans.variable} ${dmSans.className} flex min-h-dvh min-w-0 flex-col bg-gradient-to-b from-stone-50 via-white to-emerald-50/30 text-zinc-900 antialiased transition-colors duration-300 dark:bg-[#262626] dark:text-neutral-300`}
      >
        <ThemeInitScript />
        <ThemeHydrationSync />
        <Providers>
          <AppHeader />
          <main className="min-h-0 min-w-0 flex-1 dark:bg-[#262626]">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
