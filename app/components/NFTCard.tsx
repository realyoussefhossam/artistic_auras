"use client";

import { NFTImage } from "@/components/NFTImage";
import { cn } from "@/lib/utils";

type Rarity = "Common" | "Rare" | "Epic" | "Legendary";

interface NFTCardProps {
  tokenId: number;
  name: string;
  imageUri: string;
  rarity?: Rarity;
  traits?: { color?: string; energy?: string };
  onClick?: () => void;
}

const rarityClasses: Record<Rarity, string> = {
  Common: "text-outline border-outline/30 bg-surface-variant/30",
  Rare: "text-secondary border-secondary/30 bg-secondary-container/30",
  Epic: "text-primary border-primary/30 bg-primary-container/30",
  Legendary: "text-tertiary border-tertiary/30 bg-tertiary-container/30",
};

export function NFTCard({
  tokenId,
  name,
  imageUri,
  rarity = "Common",
  traits,
  onClick,
}: NFTCardProps) {
  const paddedId = tokenId.toString().padStart(3, "0");

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className="glass-panel aura-hover group flex h-[400px] cursor-pointer flex-col overflow-hidden rounded-xl transition-all duration-300"
    >
      <div className="relative h-3/4 overflow-hidden">
        <NFTImage
          ipfsUri={imageUri}
          tokenId={tokenId}
          alt={name}
          fill
          sizes="300px"
          className="transform object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 p-4 text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="mb-2 font-mono text-xs uppercase tracking-widest text-primary">
            Traits
          </div>
          {traits?.color ? (
            <div className="mb-1 text-on-surface">Color: {traits.color}</div>
          ) : null}
          {traits?.energy ? (
            <div className="text-on-surface">Energy: {traits.energy}</div>
          ) : null}
          {!traits?.color && !traits?.energy ? (
            <div className="text-on-surface-variant">No traits</div>
          ) : null}
        </div>
      </div>
      <div className="flex flex-grow flex-col justify-between bg-surface-container/50 p-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <h3 className="font-heading text-lg text-on-surface">{name}</h3>
            <span className="font-mono text-xs text-on-surface-variant">
              Aura #{paddedId}
            </span>
          </div>
          <span
            className={cn(
              "rounded-md border px-2 py-1 font-mono text-xs",
              rarityClasses[rarity],
            )}
          >
            {rarity}
          </span>
        </div>
      </div>
    </div>
  );
}
