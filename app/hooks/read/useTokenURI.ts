import { useReadContract } from "wagmi";
import { contractABI, getContractAddress } from "@/lib/contract";

export function useTokenURI(tokenId: bigint, chainId: number) {
  return useReadContract({
    abi: contractABI,
    address: getContractAddress(chainId),
    functionName: "tokenURI",
    args: [tokenId],
  });
}
