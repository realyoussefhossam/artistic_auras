"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { resolveIpfsUri, resolveIpfsUriFallback } from "@/lib/ipfs";

interface NFTImageProps extends Omit<ImageProps, "src" | "onError"> {
  ipfsUri: string;
  tokenId?: number;
}

export function NFTImage({ ipfsUri, tokenId, alt, ...props }: NFTImageProps) {
  // Prefer the local copy in /public/art/<tokenId>.png (instant, no gateway).
  const local = tokenId ? `/art/${tokenId}.png` : null;
  const primary = local ?? resolveIpfsUri(ipfsUri);
  const ipfsPrimary = resolveIpfsUri(ipfsUri);
  const ipfsFallback = resolveIpfsUriFallback(ipfsUri);

  const [src, setSrc] = useState(primary);
  const [stage, setStage] = useState<"local" | "ipfs" | "fallback">(
    local ? "local" : "ipfs",
  );

  return (
    <Image
      {...props}
      src={src}
      alt={alt}
      onError={() => {
        if (stage === "local") {
          setSrc(ipfsPrimary);
          setStage("ipfs");
        } else if (stage === "ipfs") {
          setSrc(ipfsFallback);
          setStage("fallback");
        }
      }}
    />
  );
}
