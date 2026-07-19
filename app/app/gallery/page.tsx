"use client";

import { useState } from "react";
import { useChainId } from "wagmi";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { NFTCard } from "@/components/NFTCard";
import { NFTModal } from "@/components/NFTModal";
import { AURA_NFTS, type AuraNFT } from "@/lib/nfts";
import { useTotalSupply } from "@/hooks/read/useTotalSupply";
import { useMintedNFTs, type MintedNFT } from "@/hooks/read/useMintedNFTs";

type Rarity = "Common" | "Rare" | "Epic" | "Legendary";

const RARITY_BY_TOKEN: Record<number, Rarity> = {
  1: "Legendary",
  2: "Rare",
  3: "Epic",
  4: "Common",
  5: "Rare",
  6: "Legendary",
  7: "Epic",
  8: "Common",
  9: "Rare",
  10: "Legendary",
  11: "Epic",
  12: "Common",
  13: "Rare",
  14: "Legendary",
  15: "Epic",
  16: "Common",
  17: "Rare",
  18: "Legendary",
  19: "Epic",
  20: "Common",
  21: "Legendary",
};

const COLOR_KEYS: Array<"primary" | "secondary" | "tertiary" | "outline"> = [
  "primary",
  "tertiary",
  "secondary",
  "outline",
];

function getTraits(nft: AuraNFT) {
  const colorAttr = nft.attributes.find((a) => a.traitType === "Color Scheme");
  const energyAttr = nft.attributes.find((a) => a.traitType === "Energy Source");
  return {
    color: colorAttr?.value,
    energy: energyAttr?.value,
  };
}

function getOnChainTraits(nft: MintedNFT) {
  if (!nft.metadata?.attributes) return {};
  const colorAttr = nft.metadata.attributes.find(
    (a) => a.trait_type === "Color Scheme",
  );
  const energyAttr = nft.metadata.attributes.find(
    (a) => a.trait_type === "Energy Source",
  );
  return {
    color: colorAttr?.value,
    energy: energyAttr?.value,
  };
}

export default function GalleryPage() {
  const chainId = useChainId();
  const { data: totalSupply } = useTotalSupply(chainId);
  const { nfts: mintedNfts, isLoading } = useMintedNFTs(
    totalSupply as bigint | undefined,
  );

  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);

  const mintedCount =
    totalSupply !== undefined && totalSupply !== null ? Number(totalSupply) : 0;

  const selectedNft = selectedTokenId !== null ? AURA_NFTS[selectedTokenId] : null;
  const selectedMinted = mintedNfts.find(
    (n) => n.tokenId === (selectedTokenId !== null ? selectedTokenId + 1 : -1),
  );

  return (
    <>
      <Header />

      <main className="flex-grow flex flex-col md:flex-row max-w-[1440px] mx-auto w-full px-5 md:px-16 py-12 gap-6">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 flex-shrink-0 flex flex-col gap-8">
          <div className="glass-panel rounded-xl p-6">
            <h2 className="font-heading text-2xl mb-6 text-on-surface">Filters</h2>
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="font-mono text-xs text-outline mb-3 uppercase">
                  Collection Stats
                </h3>
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Minted</span>
                    <span className="font-mono text-on-surface">
                      {mintedCount} / 21
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Remaining</span>
                    <span className="font-mono text-primary">
                      {21 - mintedCount}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-mono text-xs text-outline mb-3 uppercase">
                  Sort By
                </h3>
                <select className="w-full bg-black/30 border border-outline-variant/30 rounded-lg p-2 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                  <option>Recently Minted</option>
                  <option>ID: Low to High</option>
                  <option>ID: High to Low</option>
                  <option>Rarity: Legendary First</option>
                </select>
              </div>
              <div>
                <h3 className="font-mono text-xs text-outline mb-3 uppercase">
                  Traits
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center justify-between cursor-pointer mb-2">
                      <span>Color Scheme</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center justify-between cursor-pointer mb-2">
                      <span>Energy Source</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center justify-between cursor-pointer mb-2">
                      <span>Element</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Gallery Grid */}
        <section className="flex-grow">
          <h1 className="font-heading text-5xl md:text-7xl mb-8 text-on-surface">
            The Gallery
          </h1>
          {isLoading && mintedCount > 0 && (
            <p className="text-on-surface-variant mb-6 font-mono text-sm">
              Loading on-chain data...
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {AURA_NFTS.map((nft) => {
              const rarity = RARITY_BY_TOKEN[nft.tokenId] ?? "Common";
              const isMinted = nft.tokenId <= mintedCount;
              const minted = mintedNfts.find((m) => m.tokenId === nft.tokenId);

              const traits = minted
                ? getOnChainTraits(minted)
                : getTraits(nft);

              const name =
                minted?.metadata?.name ?? nft.name;

              const imageUri = minted?.metadata?.image ?? nft.image;

              return (
                <div key={nft.tokenId} className="relative">
                  <NFTCard
                    tokenId={nft.tokenId}
                    name={name}
                    imageUri={imageUri}
                    rarity={rarity}
                    traits={traits}
                    onClick={() => setSelectedTokenId(nft.tokenId - 1)}
                  />
                  {!isMinted && (
                    <div className="absolute top-2 right-2 z-10 rounded-md bg-black/70 px-2 py-1 font-mono text-xs text-outline backdrop-blur-sm">
                      Not Minted
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <NFTModal
        open={selectedNft !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedTokenId(null);
        }}
        nft={
          selectedNft
            ? {
                tokenId: selectedNft.tokenId,
                name:
                  selectedMinted?.metadata?.name ?? selectedNft.name,
                description:
                  selectedMinted?.metadata?.description ??
                  selectedNft.description,
                imageUri:
                  selectedMinted?.metadata?.image ?? selectedNft.image,
                rarity: RARITY_BY_TOKEN[selectedNft.tokenId] ?? "Common",
                attributes: (selectedMinted?.metadata?.attributes ??
                  selectedNft.attributes.map((a) => ({
                    traitType: a.traitType,
                    value: a.value,
                  }))).map((a, i) => ({
                  traitType:
                    "traitType" in a
                      ? a.traitType
                      : (a as { trait_type: string }).trait_type,
                  value: a.value,
                  colorKey: COLOR_KEYS[i % COLOR_KEYS.length],
                })),
              }
            : {
                tokenId: 0,
                name: "",
                description: "",
                imageUri: "",
              }
        }
      />

      <Footer />
    </>
  );
}
