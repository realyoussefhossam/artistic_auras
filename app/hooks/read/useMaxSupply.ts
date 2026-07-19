import { useReadContract } from "wagmi";
import { contractABI, getContractAddress } from "@/lib/contract";

export function useMaxSupply(chainId: number) {
  return useReadContract({
    abi: contractABI,
    address: getContractAddress(chainId),
    functionName: "MAX_SUPPLY",
  });
}
