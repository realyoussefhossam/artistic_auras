"use client";

import { useEffect, useState } from "react";
import { useChainId, useReadContracts } from "wagmi";
import type { Abi } from "viem";
import { contractABI, getContractAddress } from "@/lib/contract";
import { resolveIpfsUri } from "@/lib/ipfs";

export interface MintedNFT {
  tokenId: number;
  tokenURI: string;
  owner: string;
  metadata?: {
    name: string;
    description: string;
    image: string;
    attributes: { trait_type: string; value: string }[];
  };
}

export function useMintedNFTs(totalSupply: bigint | undefined) {
  const chainId = useChainId();
  const count = totalSupply !== undefined ? Number(totalSupply) : 0;
  const [nfts, setNfts] = useState<MintedNFT[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const abi = contractABI as unknown as Abi;
  const address = getContractAddress(chainId);
  const tokenIds = Array.from({ length: count }, (_, i) => BigInt(i + 1));

  const { data, isLoading: isContractsLoading } = useReadContracts({
    contracts: tokenIds.flatMap((id) => [
      {
        abi,
        address,
        functionName: "tokenURI",
        args: [id],
      },
      {
        abi,
        address,
        functionName: "ownerOf",
        args: [id],
      },
    ]),
    query: { enabled: count > 0 },
  });

  useEffect(() => {
    if (!data || data.length === 0) {
      setNfts([]);
      return;
    }

    setIsLoading(true);
    const newNfts: MintedNFT[] = [];

    for (let i = 0; i < count; i++) {
      const uriResult = data[i * 2];
      const ownerResult = data[i * 2 + 1];
      if (uriResult?.result && ownerResult?.result) {
        const tokenURI = uriResult.result as string;
        const owner = ownerResult.result as string;
        newNfts.push({
          tokenId: i + 1,
          tokenURI,
          owner,
        });
      }
    }

    // Fetch metadata for each token URI
    Promise.all(
      newNfts.map(async (nft) => {
        try {
          const res = await fetch(resolveIpfsUri(nft.tokenURI));
          const json = await res.json();
          return { ...nft, metadata: json };
        } catch {
          return nft;
        }
      }),
    ).then((withMetadata) => {
      setNfts(withMetadata);
      setIsLoading(false);
    });
  }, [data, count]);

  return { nfts, isLoading: isContractsLoading || isLoading };
}
