import type { Metadata } from "next";
import localFont from "next/font/local";
import { Sono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const nhg = localFont({
  src: [
    {
      path: "../public/fonts/NHaasGroteskDSPro-65Md.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/NHaasGroteskDSPro-95Blk.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-nhg",
  display: "swap",
});

const sono = Sono({
  subsets: ["latin"],
  variable: "--font-sono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://valeriolorenzo.app"),
  title: "Valerio Lorenzo — Artistic Auras",
  description:
    "Artistic Auras — a 21-piece abstract NFT collection by digital artist Valerio Lorenzo.",
  authors: [{ name: "Valerio Lorenzo" }],
  openGraph: {
    title: "Valerio Lorenzo — Artistic Auras",
    description:
      "Artistic Auras — a 21-piece abstract NFT collection by digital artist Valerio Lorenzo.",
    url: "https://valeriolorenzo.app",
    siteName: "Valerio Lorenzo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Valerio Lorenzo — Artistic Auras",
    description:
      "Artistic Auras — a 21-piece abstract NFT collection by digital artist Valerio Lorenzo.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${nhg.variable} ${sono.variable}`}
    >
      <body className="min-h-screen flex flex-col antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
