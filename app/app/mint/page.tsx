"use client";

import { useState } from "react";
import { useChainId } from "wagmi";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MintButton } from "@/components/MintButton";
import { MintSuccessModal } from "@/components/MintSuccessModal";
import { NFTImage } from "@/components/NFTImage";
import { useTotalSupply } from "@/hooks/read/useTotalSupply";
import { useMintPrice } from "@/hooks/read/useMintPrice";
import { formatEther } from "viem";
import { AURA_NFTS } from "@/lib/nfts";

export default function MintPage() {
  const chainId = useChainId();
  const { data: totalSupply } = useTotalSupply(chainId);
  const { data: mintPrice } = useMintPrice(chainId);

  const [successOpen, setSuccessOpen] = useState(false);
  const [mintedTokenId, setMintedTokenId] = useState<bigint | undefined>();
  const [txHash, setTxHash] = useState<string | undefined>();

  const nextTokenId =
    totalSupply !== undefined && totalSupply !== null
      ? Number(totalSupply) + 1
      : null;

  const priceDisplay =
    mintPrice !== undefined && mintPrice !== null
      ? `${formatEther(mintPrice as bigint)} ETH`
      : "0.04 ETH";

  const previewNft = nextTokenId !== null
    ? AURA_NFTS.find((n) => n.tokenId === nextTokenId) ?? AURA_NFTS[0]
    : AURA_NFTS[0];

  return (
    <>
      <Header />

      <main className="flex-grow flex items-center justify-center px-5 py-20 md:px-16">
        <div className="mx-auto w-full max-w-[1440px]">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            {/* Preview */}
            <div className="card group relative aspect-square w-full overflow-hidden rounded-lg md:aspect-[4/5]">
              <NFTImage
                ipfsUri={previewNft.image}
                tokenId={previewNft.tokenId}
                alt="Genesis Aura preview"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-full border-t border-border-default bg-surface/80 p-6 backdrop-blur-sm">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="mb-1 text-xs uppercase tracking-wider text-accent">
                      Next to Mint
                    </p>
                    <h2 className="font-heading text-2xl font-black text-primary">
                      Genesis Aura #
                      {nextTokenId !== null
                        ? String(nextTokenId).padStart(3, "0")
                        : "???"}
                    </h2>
                  </div>
                  <div className="text-right">
                    <p className="mb-1 text-xs text-muted">
                      Current Mint
                    </p>
                    <p className="font-heading text-2xl font-black text-primary">
                      {priceDisplay}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mint Interface */}
            <div className="flex flex-col justify-center">
              <div className="card rounded-lg p-8 md:p-12">
                <h1 className="mb-6 font-heading text-3xl font-black text-primary md:text-4xl">
                  Mint Your Aura
                </h1>
                <p className="mb-10 text-base text-secondary">
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

      <Footer />
    </>
  );
}
