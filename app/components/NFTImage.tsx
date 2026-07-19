"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { resolveIpfsUri } from "@/lib/ipfs";

interface NFTImageProps extends Omit<ImageProps, "src" | "onError"> {
  ipfsUri: string;
  tokenId?: number;
}

export function NFTImage({ ipfsUri, tokenId, alt, ...props }: NFTImageProps) {
  const primary = resolveIpfsUri(ipfsUri);
  const fallback = tokenId ? `/art/${tokenId}.png` : null;
  const [src, setSrc] = useState(primary);
  const [usedFallback, setUsedFallback] = useState(false);

  return (
    <Image
      {...props}
      src={src}
      alt={alt}
      onError={() => {
        if (!usedFallback && fallback) {
          setSrc(fallback);
          setUsedFallback(true);
        }
      }}
    />
  );
}
