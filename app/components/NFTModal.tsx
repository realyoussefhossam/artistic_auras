"use client";

import Image from "next/image";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { resolveIpfsUri } from "@/lib/ipfs";
import { cn } from "@/lib/utils";

type Rarity = "Common" | "Rare" | "Epic" | "Legendary";
type ColorKey = "primary" | "secondary" | "tertiary" | "outline";

interface NFTAttribute {
  traitType: string;
  value: string;
  rarityPercent?: string;
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
    rarity?: Rarity;
    attributes?: NFTAttribute[];
  };
}

const rarityClasses: Record<Rarity, string> = {
  Common: "text-outline border-outline/30 bg-surface-variant/30",
  Rare: "text-secondary border-secondary/30 bg-secondary-container/30",
  Epic: "text-primary border-primary/30 bg-primary-container/30",
  Legendary: "text-tertiary border-tertiary/30 bg-tertiary-container/30",
};

const colorKeyBorderClasses: Record<ColorKey, string> = {
  primary: "border-l-primary/50",
  secondary: "border-l-secondary/50",
  tertiary: "border-l-tertiary/50",
  outline: "border-l-outline/50",
};

export function NFTModal({ open, onOpenChange, nft }: NFTModalProps) {
  const paddedId = nft.tokenId.toString().padStart(3, "0");
  const imageSrc = resolveIpfsUri(nft.imageUri);
  const rarity = nft.rarity ?? "Common";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="glass-panel custom-scrollbar max-h-[90vh] w-full max-w-4xl gap-0 overflow-y-auto rounded-xl p-0 sm:max-w-4xl"
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute right-3 top-3 z-10 rounded-md p-1.5 text-on-surface-variant transition-colors hover:bg-surface-variant/40 hover:text-on-surface"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>
        <div className="flex flex-col md:flex-row">
          <div className="relative h-72 w-full md:h-auto md:w-1/2">
            <Image
              src={imageSrc}
              alt={nft.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="custom-scrollbar flex max-h-[90vh] w-full flex-col gap-4 overflow-y-auto p-6 md:w-1/2">
            <DialogHeader className="gap-2">
              <span className="font-mono text-xs uppercase tracking-widest text-on-surface-variant">
                Aura #{paddedId}
              </span>
              <DialogTitle className="font-heading text-2xl text-on-surface">
                {nft.name}
              </DialogTitle>
              <span
                className={cn(
                  "w-fit rounded-md border px-2 py-1 font-mono text-xs",
                  rarityClasses[rarity],
                )}
              >
                {rarity}
              </span>
            </DialogHeader>
            {nft.description ? (
              <p className="text-sm leading-relaxed text-on-surface-variant">
                {nft.description}
              </p>
            ) : null}
            {nft.attributes && nft.attributes.length > 0 ? (
              <div className="flex flex-col gap-3">
                <div className="font-mono text-xs uppercase tracking-widest text-primary">
                  Attributes
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {nft.attributes.map((attr) => {
                    const colorKey = attr.colorKey ?? "primary";
                    return (
                      <div
                        key={attr.traitType}
                        className={cn(
                          "glass-panel rounded-lg border-l-2 p-3",
                          colorKeyBorderClasses[colorKey],
                        )}
                      >
                        <div className="font-mono text-xs uppercase tracking-wider text-on-surface-variant">
                          {attr.traitType}
                        </div>
                        <div className="mt-1 text-sm text-on-surface">
                          {attr.value}
                        </div>
                        {attr.rarityPercent ? (
                          <div className="mt-1 font-mono text-xs text-primary">
                            {attr.rarityPercent}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
            <Button variant="default" size="lg" className="mt-2 w-full">
              View on OpenSea
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
