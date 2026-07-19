"use client";

import { useState, useMemo } from "react";
import { useChainId } from "wagmi";
import { Search, X } from "lucide-react";
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

type SortOption = "id-asc" | "id-desc" | "rarity-desc" | "recent";

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

const RARITY_ORDER: Record<Rarity, number> = {
  Legendary: 0,
  Epic: 1,
  Rare: 2,
  Common: 3,
};

export default function GalleryPage() {
  const chainId = useChainId();
  const { data: totalSupply } = useTotalSupply(chainId);
  const { nfts: mintedNfts, isLoading } = useMintedNFTs(
    totalSupply as bigint | undefined,
  );

  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("id-asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMintedOnly, setShowMintedOnly] = useState(false);

  const mintedCount =
    totalSupply !== undefined && totalSupply !== null ? Number(totalSupply) : 0;

  const filteredNfts = useMemo(() => {
    let result = AURA_NFTS.filter((nft) => {
      const isMinted = nft.tokenId <= mintedCount;

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        if (!nft.name.toLowerCase().includes(q) && !String(nft.tokenId).includes(q))
          return false;
      }

      if (showMintedOnly && !isMinted) return false;

      return true;
    });

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "id-asc":
          return a.tokenId - b.tokenId;
        case "id-desc":
          return b.tokenId - a.tokenId;
        case "rarity-desc":
          return (
            RARITY_ORDER[RARITY_BY_TOKEN[a.tokenId] ?? "Common"] -
            RARITY_ORDER[RARITY_BY_TOKEN[b.tokenId] ?? "Common"]
          );
        case "recent":
          return b.tokenId - a.tokenId;
        default:
          return 0;
      }
    });

    return result;
  }, [searchQuery, showMintedOnly, sortBy, mintedCount]);

  const hasFilters = searchQuery.trim() !== "" || showMintedOnly;

  const clearFilters = () => {
    setSearchQuery("");
    setShowMintedOnly(false);
  };

  const selectedNft = selectedTokenId !== null ? AURA_NFTS[selectedTokenId] : null;
  const selectedMinted = mintedNfts.find(
    (n) => n.tokenId === (selectedTokenId !== null ? selectedTokenId + 1 : -1),
  );

  return (
    <>
      <Header />

      <main className="flex-grow flex flex-col md:flex-row max-w-[1440px] mx-auto w-full px-5 md:px-16 py-12 gap-6">
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="glass-panel rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-2xl text-on-surface">Filters</h2>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="font-mono text-xs text-primary hover:text-secondary transition-colors flex items-center gap-1"
                >
                  <X className="size-3" />
                  Clear
                </button>
              )}
            </div>

            <div className="flex flex-col gap-6">
              {/* Stats */}
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
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Showing</span>
                    <span className="font-mono text-on-surface">
                      {filteredNfts.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Search */}
              <div>
                <h3 className="font-mono text-xs text-outline mb-3 uppercase">
                  Search
                </h3>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-outline" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ID or name..."
                    className="input-recessed w-full rounded-lg pl-8 pr-2 py-2 text-sm text-on-surface placeholder:text-outline"
                  />
                </div>
              </div>

              {/* Sort */}
              <div>
                <h3 className="font-mono text-xs text-outline mb-3 uppercase">
                  Sort By
                </h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full bg-black/30 border border-outline-variant/30 rounded-lg p-2 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value="id-asc">ID: Low to High</option>
                  <option value="id-desc">ID: High to Low</option>
                  <option value="rarity-desc">Rarity: Legendary First</option>
                  <option value="recent">Recently Minted</option>
                </select>
              </div>

              {/* Minted Only */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showMintedOnly}
                  onChange={(e) => setShowMintedOnly(e.target.checked)}
                  className="rounded border-outline-variant/30 bg-black/30 text-primary focus:ring-primary"
                />
                <span className="text-sm text-on-surface">Minted only</span>
              </label>
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
          {filteredNfts.length === 0 ? (
            <div className="glass-panel rounded-xl p-12 text-center">
              <p className="text-on-surface-variant mb-2">
                No Auras match your filters.
              </p>
              <button
                onClick={clearFilters}
                className="text-primary hover:text-secondary transition-colors font-mono text-sm"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredNfts.map((nft) => {
                const rarity = RARITY_BY_TOKEN[nft.tokenId] ?? "Common";
                const isMinted = nft.tokenId <= mintedCount;
                const minted = mintedNfts.find((m) => m.tokenId === nft.tokenId);

                const traits = minted
                  ? getOnChainTraits(minted)
                  : getTraits(nft);

                const name = minted?.metadata?.name ?? nft.name;
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
          )}
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
                name: selectedMinted?.metadata?.name ?? selectedNft.name,
                description:
                  selectedMinted?.metadata?.description ??
                  selectedNft.description,
                imageUri: selectedMinted?.metadata?.image ?? selectedNft.image,
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
