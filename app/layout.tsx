import type { Metadata } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart-provider";
import { BRAND_NAME, OFFER } from "@/lib/site";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
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
    <html
      lang="en"
      className={`${montserrat.variable} ${playfair.variable} h-full scroll-smooth`}
    >
      <body className="font-sans min-h-full flex flex-col bg-brand-bg text-brand-text antialiased">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
