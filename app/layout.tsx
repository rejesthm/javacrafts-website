import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { BRAND_NAME, OFFER } from "@/lib/site";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `${BRAND_NAME} — Personalized engraved gifts`,
  description: OFFER,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} h-full scroll-smooth`}>
      <body className="font-sans min-h-full flex flex-col bg-brand-bg text-brand-text antialiased">
        {children}
      </body>
    </html>
  );
}
