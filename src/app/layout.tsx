import type { Metadata } from "next";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import StoreShell from "@/components/StoreShell";

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const sourceSans = Source_Sans_3({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Velvety — Beauty & Wellness",
  description: "Nature-inspired skincare and wellness",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${sourceSans.variable}`}>
      <body className="min-h-screen flex flex-col">
        <SessionProvider>
          <StoreShell>{children}</StoreShell>
        </SessionProvider>
      </body>
    </html>
  );
}
