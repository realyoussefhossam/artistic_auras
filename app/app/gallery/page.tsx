"use client";

import { useState, useMemo } from "react";
import { useChainId } from "wagmi";
import { ChevronDown, ChevronUp, X, Search } from "lucide-react";
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

const RARITY_ORDER: Record<Rarity, number> = {
  Legendary: 0,
  Epic: 1,
  Rare: 2,
  Common: 3,
};

const COLOR_KEYS: Array<"primary" | "secondary" | "tertiary" | "outline"> = [
  "primary",
  "tertiary",
  "secondary",
  "outline",
];

const TRAIT_TYPES = [
  "Color Scheme",
  "Energy Source",
  "Element",
  "Form",
  "Mood",
  "Theme",
  "Movement",
] as const;

type SortOption = "recent" | "id-asc" | "id-desc" | "rarity-desc";

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

function getAttrValue(nft: AuraNFT, traitType: string): string | undefined {
  return nft.attributes.find((a) => a.traitType === traitType)?.value;
}

function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between cursor-pointer mb-2 text-on-surface hover:text-primary transition-colors"
      >
        <span>{title}</span>
        {open ? (
          <ChevronUp className="size-4 text-outline" />
        ) : (
          <ChevronDown className="size-4 text-outline" />
        )}
      </button>
      {open && <div className="pl-2 space-y-2">{children}</div>}
    </div>
  );
}

export default function GalleryPage() {
  const chainId = useChainId();
  const { data: totalSupply } = useTotalSupply(chainId);
  const { nfts: mintedNfts, isLoading } = useMintedNFTs(
    totalSupply as bigint | undefined,
  );

  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("id-asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRarities, setSelectedRarities] = useState<Set<Rarity>>(new Set());
  const [selectedTraits, setSelectedTraits] = useState<
    Record<string, Set<string>>
  >({});
  const [showMintedOnly, setShowMintedOnly] = useState(false);

  const mintedCount =
    totalSupply !== undefined && totalSupply !== null ? Number(totalSupply) : 0;

  // Build available trait values from all NFTs
  const availableTraits = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const traitType of TRAIT_TYPES) {
      const values = new Set<string>();
      for (const nft of AURA_NFTS) {
        const val = getAttrValue(nft, traitType);
        if (val) values.add(val);
      }
      map[traitType] = Array.from(values).sort();
    }
    return map;
  }, []);

  // Filter and sort NFTs
  const filteredNfts = useMemo(() => {
    let result = AURA_NFTS.filter((nft) => {
      const rarity = RARITY_BY_TOKEN[nft.tokenId] ?? "Common";
      const isMinted = nft.tokenId <= mintedCount;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const nameMatch = nft.name.toLowerCase().includes(q);
        const idMatch = String(nft.tokenId).includes(q);
        if (!nameMatch && !idMatch) return false;
      }

      // Minted only filter
      if (showMintedOnly && !isMinted) return false;

      // Rarity filter
      if (selectedRarities.size > 0 && !selectedRarities.has(rarity)) {
        return false;
      }

      // Trait filters
      for (const [traitType, selectedValues] of Object.entries(selectedTraits)) {
        if (selectedValues.size === 0) continue;
        const nftValue = getAttrValue(nft, traitType);
        if (!nftValue || !selectedValues.has(nftValue)) return false;
      }

      return true;
    });

    // Sort
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
  }, [searchQuery, showMintedOnly, selectedRarities, selectedTraits, sortBy, mintedCount]);

  const activeFilterCount =
    selectedRarities.size +
    Object.values(selectedTraits).reduce((sum, s) => sum + s.size, 0) +
    (showMintedOnly ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedRarities(new Set());
    setSelectedTraits({});
    setShowMintedOnly(false);
    setSearchQuery("");
  };

  const toggleRarity = (r: Rarity) => {
    setSelectedRarities((prev) => {
      const next = new Set(prev);
      if (next.has(r)) next.delete(r);
      else next.add(r);
      return next;
    });
  };

  const toggleTrait = (traitType: string, value: string) => {
    setSelectedTraits((prev) => {
      const next = { ...prev };
      const current = new Set(next[traitType] ?? []);
      if (current.has(value)) current.delete(value);
      else current.add(value);
      next[traitType] = current;
      return next;
    });
  };

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
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-2xl text-on-surface">Filters</h2>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="font-mono text-xs text-primary hover:text-secondary transition-colors flex items-center gap-1"
                >
                  <X className="size-3" />
                  Clear ({activeFilterCount})
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
              <div>
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

              {/* Rarity */}
              <div>
                <h3 className="font-mono text-xs text-outline mb-3 uppercase">
                  Rarity
                </h3>
                <div className="space-y-2">
                  {(["Legendary", "Epic", "Rare", "Common"] as Rarity[]).map((r) => (
                    <label key={r} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedRarities.has(r)}
                        onChange={() => toggleRarity(r)}
                        className="rounded border-outline-variant/30 bg-black/30 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-on-surface">{r}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Trait Filters */}
              <div>
                <h3 className="font-mono text-xs text-outline mb-3 uppercase">
                  Traits
                </h3>
                <div className="space-y-4">
                  {TRAIT_TYPES.map((traitType) => (
                    <CollapsibleSection key={traitType} title={traitType}>
                      {availableTraits[traitType]?.map((value) => {
                        const checked =
                          selectedTraits[traitType]?.has(value) ?? false;
                        return (
                          <label
                            key={value}
                            className="flex items-start gap-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleTrait(traitType, value)}
                              className="rounded border-outline-variant/30 bg-black/30 text-primary focus:ring-primary mt-0.5"
                            />
                            <span className="text-xs text-on-surface-variant leading-relaxed">
                              {value}
                            </span>
                          </label>
                        );
                      })}
                    </CollapsibleSection>
                  ))}
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
          {filteredNfts.length === 0 ? (
            <div className="glass-panel rounded-xl p-12 text-center">
              <p className="text-on-surface-variant mb-2">No Auras match your filters.</p>
              <button
                onClick={clearAllFilters}
                className="text-primary hover:text-secondary transition-colors font-mono text-sm"
              >
                Clear all filters
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
