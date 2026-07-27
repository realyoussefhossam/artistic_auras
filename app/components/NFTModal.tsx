"use client";

import { X, ChevronLeft, ChevronRight } from "lucide-react";
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
  prevNft?: { tokenId: number; imageUri: string; name: string } | null;
  nextNft?: { tokenId: number; imageUri: string; name: string } | null;
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
  prevNft,
  nextNft,
}: NFTModalProps) {
  const chainId = useChainId();
  const paddedId = nft.tokenId.toString().padStart(3, "0");

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
          {/* Image area — 3/5 width, with prev/next peek thumbnails */}
          <div className="relative h-72 w-full flex-shrink-0 md:h-auto md:w-3/5">
            <NFTImage
              ipfsUri={nft.imageUri}
              tokenId={nft.tokenId}
              alt={nft.name}
              fill
              sizes="(max-width: 768px) 100vw, 60vw"
              className="object-cover"
            />

            {/* Prev peek thumbnail */}
            {onPrev && hasPrev && prevNft && (
              <button
                type="button"
                onClick={onPrev}
                aria-label="Previous NFT"
                className="group/peek absolute left-0 top-0 z-20 flex h-full w-20 flex-col items-center justify-center gap-2 bg-gradient-to-r from-black/70 to-transparent transition-all hover:w-28 md:w-24"
              >
                <div className="relative h-16 w-16 overflow-hidden rounded-md border border-white/30 shadow-lg transition-transform group-hover/peek:scale-110 md:h-20 md:w-20">
                  <NFTImage
                    ipfsUri={prevNft.imageUri}
                    tokenId={prevNft.tokenId}
                    alt={prevNft.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
                <ChevronLeft className="size-6 text-white drop-shadow" />
              </button>
            )}

            {/* Next peek thumbnail */}
            {onNext && hasNext && nextNft && (
              <button
                type="button"
                onClick={onNext}
                aria-label="Next NFT"
                className="group/peek absolute right-0 top-0 z-20 flex h-full w-20 flex-col items-center justify-center gap-2 bg-gradient-to-l from-black/70 to-transparent transition-all hover:w-28 md:w-24"
              >
                <div className="relative h-16 w-16 overflow-hidden rounded-md border border-white/30 shadow-lg transition-transform group-hover/peek:scale-110 md:h-20 md:w-20">
                  <NFTImage
                    ipfsUri={nextNft.imageUri}
                    tokenId={nextNft.tokenId}
                    alt={nextNft.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
                <ChevronRight className="size-6 text-white drop-shadow" />
              </button>
            )}
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
