import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Matches --font-body: 'Geist' from the design file
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist", // consumed as var(--font-geist) in globals.css
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

// Matches --font-mono: 'Geist Mono' from the design file
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono", // consumed as var(--font-geist-mono) in globals.css
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "NumVerify — Bengali Number Matcher",
  description:
    "Match Bengali 7-digit numbers across Excel and PDF/image files.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
