"use client";

import { NFTImage } from "@/components/NFTImage";

interface NFTCardProps {
  tokenId: number;
  name: string;
  imageUri: string;
  traits?: { color?: string; energy?: string };
  onClick?: () => void;
}

export function NFTCard({
  tokenId,
  name,
  imageUri,
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
      className="card group flex h-[400px] cursor-pointer flex-col overflow-hidden rounded-lg transition-transform duration-300 hover:-translate-y-1"
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 p-4 text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="mb-2 text-xs uppercase tracking-widest text-accent">
            Traits
          </div>
          {traits?.color ? (
            <div className="mb-1 text-white">Color: {traits.color}</div>
          ) : null}
          {traits?.energy ? (
            <div className="text-white">Energy: {traits.energy}</div>
          ) : null}
          {!traits?.color && !traits?.energy ? (
            <div className="text-white/70">No traits</div>
          ) : null}
        </div>
      </div>
      <div className="flex flex-grow flex-col justify-between bg-surface p-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <h3 className="font-heading text-lg font-black text-primary">{name}</h3>
            <span className="text-xs text-muted">
              Aura #{paddedId}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
