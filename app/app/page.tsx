"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import { AuroraBackground } from "@/components/AuroraBackground";
import { StatsBar } from "@/components/StatsBar";

export default function LandingPage() {
  return (
    <>
      <AuroraBackground />

      {/* Top Nav */}
      <nav className="sticky top-0 w-full z-50 bg-surface/70 backdrop-blur-xl border-b border-white/20 shadow-[0_0_20px_rgba(124,58,237,0.1)]">
        <div className="flex justify-between items-center px-5 md:px-16 py-4 max-w-[1440px] mx-auto">
          <Link
            href="/"
            className="font-heading font-bold tracking-tight text-on-surface hover:text-primary transition-colors flex items-center gap-2 text-2xl"
          >
            <Sparkles className="size-6 text-primary" />
            Artistic Auras
          </Link>
          <ul className="hidden md:flex items-center gap-8">
            <li>
              <Link
                href="/"
                className="text-primary border-b-2 border-primary pb-1 font-body"
              >
                Landing
              </Link>
            </li>
            <li>
              <Link
                href="/mint"
                className="text-on-surface-variant hover:text-on-surface transition-colors font-body"
              >
                Mint
              </Link>
            </li>
            <li>
              <Link
                href="/gallery"
                className="text-on-surface-variant hover:text-on-surface transition-colors font-body"
              >
                Gallery
              </Link>
            </li>
          </ul>
          <ConnectButton />
        </div>
      </nav>

      {/* Main */}
      <main className="flex-grow relative z-10 flex flex-col justify-center items-center px-5 md:px-16 min-h-[819px]">
        <div className="text-center max-w-4xl mx-auto flex flex-col items-center gap-8 mt-16 md:mt-0">
          <h1 className="font-heading text-4xl md:text-7xl text-white font-bold tracking-tight text-glow animate-fade-in-up">
            Artistic Auras
          </h1>
          <p className="text-lg text-on-surface-variant max-w-2xl animate-fade-in-up delay-100">
            A 21-piece abstract NFT collection capturing cosmic energy and
            vibrant expressionism. Claim your piece of the digital void.
          </p>
          <div className="animate-fade-in-up delay-200 mt-4">
            <Link
              href="/mint"
              className="bg-primary-container text-white px-10 py-4 rounded-full font-heading text-xl font-bold tracking-wide border border-white/10 hover:border-tertiary/50 hover:shadow-[0_0_25px_rgba(255,185,95,0.4)] transition-all duration-300 group relative overflow-hidden inline-flex items-center gap-2"
            >
              <span className="relative z-10 flex items-center gap-2">
                Mint Now
                <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>
        </div>

        <StatsBar className="mt-24 md:mt-32" />
      </main>

      {/* Footer */}
      <footer className="w-full py-12 bg-surface-container-lowest border-t border-outline-variant/30 relative z-10 mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center px-5 md:px-16 gap-6 max-w-[1440px] mx-auto">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="font-heading text-2xl font-bold text-on-surface flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              Artistic Auras
            </div>
            <p className="font-mono text-xs text-secondary">
              © 2024 Artistic Auras. All rights reserved.
            </p>
          </div>
          <ul className="flex flex-wrap justify-center gap-6 font-mono text-xs text-on-surface-variant">
            <li>
              <a className="hover:text-primary transition-colors duration-200" href="#">
                Discord
              </a>
            </li>
            <li>
              <a className="hover:text-primary transition-colors duration-200" href="#">
                Twitter
              </a>
            </li>
            <li>
              <a className="hover:text-primary transition-colors duration-200" href="#">
                Etherscan
              </a>
            </li>
            <li>
              <span className="text-outline-variant flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Built on Ethereum
              </span>
            </li>
          </ul>
        </div>
      </footer>
    </>
  );
}
