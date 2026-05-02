import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AppHeader } from "@/components/AppHeader";
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
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
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
      suppressHydrationWarning
      className={`h-full min-h-dvh ${dmSans.variable}`}
    >
      <body
        className={`${dmSans.className} flex min-h-dvh min-w-0 flex-col bg-gradient-to-b from-stone-50 via-white to-emerald-50/30 text-zinc-900 antialiased transition-colors duration-300 dark:from-zinc-950 dark:via-zinc-900 dark:to-emerald-950/[0.18] dark:text-zinc-100`}
      >
        <ThemeInitScript />
        <Providers>
          <AppHeader />
          <main className="min-h-0 min-w-0 flex-1">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
