"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { NFTImage } from "@/components/NFTImage";
import { AURA_NFTS } from "@/lib/nfts";

export function ArtworkCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;
    const amount = container.clientWidth * 0.8;
    container.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative w-full">
      {/* Scroll buttons */}
      <button
        type="button"
        onClick={() => scroll("left")}
        aria-label="Scroll left"
        className="card absolute left-0 top-1/2 z-10 flex size-12 -translate-y-1/2 items-center justify-center rounded-full text-primary transition-all hover:bg-surface hover:shadow-lg"
      >
        <ChevronLeft className="size-6" />
      </button>
      <button
        type="button"
        onClick={() => scroll("right")}
        aria-label="Scroll right"
        className="card absolute right-0 top-1/2 z-10 flex size-12 -translate-y-1/2 items-center justify-center rounded-full text-primary transition-all hover:bg-surface hover:shadow-lg"
      >
        <ChevronRight className="size-6" />
      </button>

      {/* Horizontal scroll container */}
      <div
        ref={scrollRef}
        className="no-scrollbar flex gap-4 overflow-x-auto scroll-smooth pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {AURA_NFTS.map((nft) => (
          <div
            key={nft.tokenId}
            className="card relative h-56 w-72 flex-shrink-0 overflow-hidden rounded-lg sm:h-64 sm:w-80"
          >
            <NFTImage
              ipfsUri={nft.image}
              tokenId={nft.tokenId}
              alt={nft.name}
              fill
              sizes="320px"
              className="object-cover transition-transform duration-500 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-full p-3">
              <span className="text-xs font-bold text-white">
                {nft.name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
