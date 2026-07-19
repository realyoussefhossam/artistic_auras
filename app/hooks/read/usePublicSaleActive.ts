import { useReadContract } from "wagmi";
import { contractABI, getContractAddress } from "@/lib/contract";

export function usePublicSaleActive(chainId: number) {
  return useReadContract({
    abi: contractABI,
    address: getContractAddress(chainId),
    functionName: "publicSaleActive",
  });
}
