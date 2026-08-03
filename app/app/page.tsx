"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useChainId } from "wagmi";
import { formatEther } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import { Header } from "@/components/Header";
import { StatsBar } from "@/components/StatsBar";
import { Footer } from "@/components/Footer";
import { useMintPrice } from "@/hooks/read/useMintPrice";
import { useTotalSupply } from "@/hooks/read/useTotalSupply";
import { LANDING_COPY } from "@/lib/landing-copy";

export default function LandingPage() {
  const chainId = useChainId();
  const { data: mintPrice } = useMintPrice(chainId);
  const { data: totalSupply } = useTotalSupply(chainId);

  const minted = totalSupply !== undefined && totalSupply !== null ? Number(totalSupply) : 0;
  const priceDisplay = mintPrice !== undefined && mintPrice !== null
    ? `${formatEther(mintPrice as bigint)} ETH`
    : "0.04 ETH";

  return (
    <>
      <Header />

      <main className="flex-grow relative z-10 flex flex-col items-center px-5 md:px-16 pt-32 pb-16">
        {/* Hero */}
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 text-center">
          <div className="card flex items-center gap-2 rounded-full px-4 py-2">
            <Sparkles className="size-4 text-accent" />
            <span className="text-sm text-secondary">{LANDING_COPY.badge}</span>
          </div>

          <h1 className="font-heading text-5xl font-black tracking-tight text-primary animate-fade-in-up md:text-7xl">
            Artistic Auras
          </h1>

          <p className="max-w-2xl text-lg text-secondary animate-fade-in-up delay-100">
            {LANDING_COPY.subtitle}
          </p>

          <div className="animate-fade-in-up delay-200 mt-4 flex items-center gap-2">
            <Link
              href="/mint"
              className="btn-accent inline-flex items-center gap-2 rounded-lg px-8 py-3 font-heading text-lg font-medium"
            >
              <span className="flex items-center gap-2">
                Mint Now
                <ArrowRight className="size-5" />
              </span>
            </Link>
            <Link
              href="/gallery"
              className="btn-outline inline-flex items-center rounded-lg px-6 py-3 font-heading text-lg"
            >
              View Gallery
            </Link>
          </div>

          <div className="mt-4">
            <ConnectButton />
          </div>
        </div>

        <StatsBar className="mt-16 md:mt-24" totalSupply={minted} mintPrice={priceDisplay} />

        {/* Overview */}
        <section className="mx-auto mt-24 max-w-3xl md:mt-32">
          <h2 className="mb-6 font-heading text-3xl font-black text-primary md:text-4xl">
            Overview
          </h2>
          <p className="text-lg leading-relaxed text-secondary">
            {LANDING_COPY.overview}
          </p>
        </section>

        {/* Purpose */}
        <section className="mx-auto mt-20 max-w-3xl">
          <h2 className="mb-6 font-heading text-3xl font-black text-primary md:text-4xl">
            Purpose
          </h2>
          <p className="text-lg leading-relaxed text-secondary">
            {LANDING_COPY.purpose}
          </p>
        </section>

        {/* Artistic Vision */}
        <section className="mx-auto mt-20 max-w-3xl">
          <h2 className="mb-6 font-heading text-3xl font-black text-primary md:text-4xl">
            Artistic Vision
          </h2>
          <p className="text-lg leading-relaxed text-secondary">
            {LANDING_COPY.vision}
          </p>
        </section>

        {/* The Concept — Year 1-5 timeline */}
        <section className="mx-auto mt-20 max-w-4xl">
          <h2 className="mb-10 text-center font-heading text-3xl font-black text-primary md:text-4xl">
            The Concept
          </h2>
          <div className="flex flex-col gap-6">
            {LANDING_COPY.concept.map((phase) => (
              <div key={phase.year} className="card rounded-lg p-6 md:p-8">
                <div className="mb-2 flex items-center gap-3">
                  <span className="label-sono font-medium rounded-full bg-accent px-3 py-1 text-accent-contrast">
                    {phase.year}
                  </span>
                  <h3 className="font-heading text-xl font-black text-primary md:text-2xl">
                    {phase.title}
                  </h3>
                </div>
                <p className="text-base leading-relaxed text-secondary">
                  {phase.body}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
