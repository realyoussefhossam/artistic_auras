"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { NFTCard } from "@/components/NFTCard";
import { NFTModal } from "@/components/NFTModal";
import { resolveIpfsUri } from "@/lib/ipfs";

interface GalleryNFT {
  tokenId: number;
  name: string;
  imageUri: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  description: string;
  traits: { color?: string; energy?: string };
  attributes: {
    traitType: string;
    value: string;
    rarityPercent?: string;
    colorKey?: "primary" | "secondary" | "tertiary" | "outline";
  }[];
}

// Placeholder data until on-chain reads are wired up
const PLACEHOLDER_NFTS: GalleryNFT[] = Array.from({ length: 21 }, (_, i) => {
  const rarities: GalleryNFT["rarity"][] = ["Common", "Rare", "Epic", "Legendary"];
  const rarity = rarities[i % rarities.length];
  return {
    tokenId: i + 1,
    name: `Aura #${String(i + 1).padStart(3, "0")}`,
    imageUri: "",
    rarity,
    description:
      "A unique manifestation of digital consciousness, captured in the Artistic Auras collection.",
    traits: { color: `Variant ${i + 1}`, energy: `Level ${((i * 7) % 100) + 1}` },
    attributes: [
      {
        traitType: "Color",
        value: `Variant ${i + 1}`,
        rarityPercent: "2%",
        colorKey: "primary",
      },
      {
        traitType: "Energy",
        value: `Level ${((i * 7) % 100) + 1}`,
        rarityPercent: "5%",
        colorKey: "tertiary",
      },
      {
        traitType: "Element",
        value: "Void Plasma",
        rarityPercent: "1%",
        colorKey: "secondary",
      },
      {
        traitType: "Mood",
        value: "Ethereal",
        rarityPercent: "12%",
        colorKey: "outline",
      },
    ],
  };
});

export default function GalleryPage() {
  const [selectedNft, setSelectedNft] = useState<GalleryNFT | null>(null);

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {PLACEHOLDER_NFTS.map((nft) => (
              <NFTCard
                key={nft.tokenId}
                tokenId={nft.tokenId}
                name={nft.name}
                imageUri={resolveIpfsUri(nft.imageUri)}
                rarity={nft.rarity}
                traits={nft.traits}
                onClick={() => setSelectedNft(nft)}
              />
            ))}
          </div>
        </section>
      </main>

      <NFTModal
        open={selectedNft !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedNft(null);
        }}
        nft={
          selectedNft
            ? {
                tokenId: selectedNft.tokenId,
                name: selectedNft.name,
                description: selectedNft.description,
                imageUri: resolveIpfsUri(selectedNft.imageUri),
                rarity: selectedNft.rarity,
                attributes: selectedNft.attributes,
              }
            : {
                tokenId: 0,
                name: "",
                description: "",
                imageUri: "",
              }
        }
      />
    </>
  );
}
