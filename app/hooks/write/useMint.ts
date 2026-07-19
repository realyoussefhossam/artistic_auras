import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, decodeEventLog, type Log, type Hex } from "viem";
import { contractABI, getContractAddress } from "@/lib/contract";

export function useMint(chainId: number) {
  const { writeContractAsync, data: hash, isPending, error } =
    useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed, data: receipt } =
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

  /** Parses the NFTMinted events from the receipt and returns the last token ID. */
  function getLastMintedTokenId(receipt: { logs: readonly Log[] } | undefined): bigint | undefined {
    if (!receipt) return undefined;
    for (let i = receipt.logs.length - 1; i >= 0; i--) {
      try {
        const decoded = decodeEventLog({
          abi: contractABI,
          data: receipt.logs[i].data,
          topics: receipt.logs[i].topics as [Hex, ...Hex[]] | [],
        });
        if (decoded.eventName === "NFTMinted") {
          const args = decoded.args as { tokenId?: bigint };
          if (args.tokenId !== undefined) {
            return args.tokenId;
          }
        }
      } catch {
        // Not an NFTMinted log — skip
      }
    }
    return undefined;
  }

  const mintedTokenId = getLastMintedTokenId(receipt);
  return { mint, hash, isPending, isConfirming, isConfirmed, error, mintedTokenId };
}
