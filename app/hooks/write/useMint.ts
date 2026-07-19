import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { contractABI, getContractAddress } from "@/lib/contract";

export function useMint(chainId: number) {
  const { writeContractAsync, data: hash, isPending, error } =
    useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const mint = async (quantity: bigint) => {
    const address = getContractAddress(chainId);
    const price = parseEther("0.04");
    return writeContractAsync({
      abi: contractABI,
      address,
      functionName: "mint",
      args: [quantity],
      value: price * quantity,
    });
  };

  return { mint, hash, isPending, isConfirming, isConfirmed, error };
}
