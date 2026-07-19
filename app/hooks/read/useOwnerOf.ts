import { useReadContract } from "wagmi";
import { contractABI, getContractAddress } from "@/lib/contract";

export function useOwnerOf(tokenId: bigint, chainId: number) {
  return useReadContract({
    abi: contractABI,
    address: getContractAddress(chainId),
    functionName: "ownerOf",
    args: [tokenId],
  });
}
