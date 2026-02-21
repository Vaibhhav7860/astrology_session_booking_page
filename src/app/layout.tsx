import type { Metadata } from "next";
import { Cinzel, Inter } from "next/font/google";
import "./globals.css";
import { CosmicBackground } from "@/components/ui/CosmicBackground";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "INTO THE STAR | Session Booking by Priya Shree Mandal",
  description: "Book an astrology, numerology, vastu, or tarot reading session with Priya Shree Mandal.",
  openGraph: {
    title: "INTO THE STAR | Priya Shree Mandal",
    description: "Premium spiritual consultations and astrology sessions.",
    siteName: "INTO THE STAR",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${cinzel.variable} ${inter.variable} font-sans antialiased min-h-screen relative`}
      >
        <CosmicBackground />

        {children}
      </body>
    </html>
  );
}
