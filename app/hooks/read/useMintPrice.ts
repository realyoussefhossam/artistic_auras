import { useReadContract } from "wagmi";
import { contractABI, getContractAddress } from "@/lib/contract";

export function useMintPrice(chainId: number) {
  return useReadContract({
    abi: contractABI,
    address: getContractAddress(chainId),
    functionName: "MINT_PRICE",
  });
}
