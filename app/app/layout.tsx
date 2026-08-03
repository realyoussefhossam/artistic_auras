import type { Metadata } from "next";
import localFont from "next/font/local";
import { Sono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ThemeProvider } from "@/components/theme-provider";

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
  title: "Artistic Auras",
  description:
    "A 21-piece abstract NFT collection capturing cosmic energy and vibrant expressionism on Ethereum.",
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
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
