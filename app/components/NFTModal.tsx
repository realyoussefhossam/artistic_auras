"use client";

import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NFTImage } from "@/components/NFTImage";
import { getOpenSeaAssetUrl, getContractAddress } from "@/lib/contract";
import { useChainId } from "wagmi";
import { cn } from "@/lib/utils";

type ColorKey = "primary" | "secondary" | "tertiary" | "outline";

interface NFTAttribute {
  traitType: string;
  value: string;
  colorKey?: ColorKey;
}

interface ThumbNft {
  tokenId: number;
  imageUri: string;
  name: string;
}

interface NFTModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nft: {
    tokenId: number;
    name: string;
    description: string;
    imageUri: string;
    attributes?: NFTAttribute[];
  };
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  allNfts?: ThumbNft[];
  onSelect?: (tokenId: number) => void;
}

const colorKeyBorderClasses: Record<ColorKey, string> = {
  primary: "border-l-accent/60",
  secondary: "border-l-secondary/60",
  tertiary: "border-l-tertiary/60",
  outline: "border-l-muted/60",
};

export function NFTModal({
  open,
  onOpenChange,
  nft,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  allNfts,
  onSelect,
}: NFTModalProps) {
  const chainId = useChainId();
  const paddedId = nft.tokenId.toString().padStart(3, "0");
  const thumbStripRef = useRef<HTMLDivElement>(null);
  const activeThumbRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll the thumbnail strip so the active thumbnail stays visible.
  useEffect(() => {
    const strip = thumbStripRef.current;
    const active = activeThumbRef.current;
    if (!strip || !active) return;
    const stripRect = strip.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    if (activeRect.left < stripRect.left || activeRect.right > stripRect.right) {
      active.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [nft.tokenId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="card flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg p-0 sm:max-w-4xl"
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute right-3 top-3 z-30 rounded-md p-1.5 text-white transition-colors hover:bg-black/40"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>

        <div className="flex flex-col md:flex-row md:flex-1 md:overflow-hidden">
          {/* Image column — thumbnail strip on top + main image */}
          <div className="flex w-full flex-col md:w-3/5">
            {/* Thumbnail strip with arrows */}
            {allNfts && allNfts.length > 1 && (
              <div className="relative flex items-center gap-1 border-b border-border-default bg-surface px-2 py-2">
                <button
                  type="button"
                  onClick={onPrev}
                  disabled={!hasPrev}
                  aria-label="Previous NFT"
                  className="flex size-7 flex-shrink-0 items-center justify-center rounded text-primary transition-colors hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <div
                  ref={thumbStripRef}
                  className="no-scrollbar flex flex-1 gap-2 overflow-x-auto scroll-smooth"
                >
                  {allNfts.map((t) => (
                    <button
                      key={t.tokenId}
                      ref={t.tokenId === nft.tokenId ? activeThumbRef : undefined}
                      type="button"
                      onClick={() => onSelect?.(t.tokenId)}
                      className={cn(
                        "relative size-14 flex-shrink-0 overflow-hidden rounded-md border-2 transition-all",
                        t.tokenId === nft.tokenId
                          ? "border-accent ring-2 ring-accent/40"
                          : "border-transparent opacity-60 hover:opacity-100",
                      )}
                      aria-label={t.name}
                    >
                      <NFTImage
                        key={`thumb-${t.tokenId}`}
                        ipfsUri={t.imageUri}
                        tokenId={t.tokenId}
                        alt={t.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={onNext}
                  disabled={!hasNext}
                  aria-label="Next NFT"
                  className="flex size-7 flex-shrink-0 items-center justify-center rounded text-primary transition-colors hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            )}

            {/* Main image */}
            <div className="relative flex-grow bg-canvas">
              <NFTImage
                key={`main-${nft.tokenId}`}
                ipfsUri={nft.imageUri}
                tokenId={nft.tokenId}
                alt={nft.name}
                fill
                sizes="(max-width: 768px) 100vw, 60vw"
                className="object-contain"
              />
            </div>
          </div>

          {/* Content — 2/5 width, scrolls independently */}
          <div className="custom-scrollbar flex w-full flex-col gap-5 overflow-y-auto p-6 md:w-2/5 md:flex-1">
            <DialogHeader className="gap-2">
              <span className="text-xs uppercase tracking-widest text-muted">
                Aura #{paddedId}
              </span>
              <DialogTitle className="font-heading text-2xl font-bold text-primary">
                {nft.name}
              </DialogTitle>
            </DialogHeader>

            {nft.description ? (
              <p className="text-sm leading-relaxed text-secondary">
                {nft.description}
              </p>
            ) : null}

            {nft.attributes && nft.attributes.length > 0 ? (
              <div className="flex flex-col gap-3">
                <div className="text-xs uppercase tracking-widest text-accent">
                  Attributes
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {nft.attributes.map((attr) => {
                    const colorKey = attr.colorKey ?? "primary";
                    return (
                      <div
                        key={attr.traitType}
                        className={cn(
                          "card rounded-lg border-l-2 p-3",
                          colorKeyBorderClasses[colorKey],
                        )}
                      >
                        <div className="text-xs uppercase tracking-wider text-muted">
                          {attr.traitType}
                        </div>
                        <div className="mt-1 text-sm text-primary">
                          {attr.value}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <a
              href={getOpenSeaAssetUrl(chainId, getContractAddress(chainId), nft.tokenId)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-accent mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-lg font-heading text-base font-bold"
            >
              View on OpenSea
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
