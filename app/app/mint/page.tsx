"use client";

import { useState } from "react";
import Image from "next/image";

import { Header } from "@/components/Header";
import { MintButton } from "@/components/MintButton";
import { MintSuccessModal } from "@/components/MintSuccessModal";

export default function MintPage() {
  const [successOpen, setSuccessOpen] = useState(false);
  const [mintedTokenId, setMintedTokenId] = useState<bigint | undefined>();
  const [txHash, setTxHash] = useState<string | undefined>();

  return (
    <>
      <Header />

      <main className="flex-grow flex items-center justify-center py-20 px-5 md:px-16">
        <div className="max-w-[1440px] w-full mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Preview */}
            <div className="relative w-full aspect-square md:aspect-[4/5] rounded-xl overflow-hidden glass-card-rounded group">
              <Image
                src="/art/1.png"
                alt="Genesis Aura preview"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-full p-6 bg-surface/40 backdrop-blur-md border-t border-white/10">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="font-mono text-xs text-primary mb-1 uppercase tracking-wider">
                      Legendary Core
                    </p>
                    <h2 className="font-heading text-2xl text-on-surface">
                      Genesis Aura #??
                    </h2>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xs text-on-surface-variant mb-1">
                      Current Mint
                    </p>
                    <p className="font-heading text-2xl text-on-surface">0.04 ETH</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mint Interface */}
            <div className="flex flex-col justify-center">
              <div className="glass-card-rounded p-8 md:p-12 shadow-[0_0_40px_rgba(124,58,237,0.05)]">
                <h1 className="font-heading text-3xl md:text-4xl text-on-surface mb-6">
                  Mint Your Aura
                </h1>
                <p className="text-base text-on-surface-variant mb-10">
                  Secure your piece of the artistic void. Each Aura is uniquely
                  generated on-chain upon minting, ensuring a one-of-a-kind
                  digital artifact.
                </p>

                <MintButton
                  onSuccess={(tokenId?: bigint, hash?: string) => {
                    setMintedTokenId(tokenId);
                    setTxHash(hash);
                    setSuccessOpen(true);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <MintSuccessModal
        open={successOpen}
        onOpenChange={setSuccessOpen}
        tokenId={mintedTokenId}
        txHash={txHash}
      />
    </>
  );
}
