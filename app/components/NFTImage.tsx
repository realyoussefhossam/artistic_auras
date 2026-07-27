"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { resolveIpfsUri, resolveIpfsUriFallback } from "@/lib/ipfs";

interface NFTImageProps extends Omit<ImageProps, "src" | "onError"> {
  ipfsUri: string;
  tokenId?: number;
}

export function NFTImage({ ipfsUri, tokenId, alt, ...props }: NFTImageProps) {
  const primary = resolveIpfsUri(ipfsUri);
  const gatewayFallback = resolveIpfsUriFallback(ipfsUri);
  const localFallback = tokenId ? `/art/${tokenId}.png` : null;
  const [src, setSrc] = useState(primary);
  const [triedGatewayFallback, setTriedGatewayFallback] = useState(false);
  const [triedLocalFallback, setTriedLocalFallback] = useState(false);

  return (
    <Image
      {...props}
      src={src}
      alt={alt}
      onError={() => {
        if (!triedGatewayFallback) {
          setSrc(gatewayFallback);
          setTriedGatewayFallback(true);
        } else if (!triedLocalFallback && localFallback) {
          setSrc(localFallback);
          setTriedLocalFallback(true);
        }
      }}
    />
  );
}
