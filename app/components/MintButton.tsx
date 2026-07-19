"use client";

import { useEffect, useRef, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { formatEther, parseEther } from "viem";
import { toast } from "sonner";
import { Minus, Plus, ArrowRight, Loader2 } from "lucide-react";
import { useMint } from "@/hooks/write/useMint";
import { usePublicSaleActive } from "@/hooks/read/usePublicSaleActive";
import { useMintPrice } from "@/hooks/read/useMintPrice";
import { useMaxSupply } from "@/hooks/read/useMaxSupply";

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 2;

type MintButtonProps = {
  onSuccess?: (tokenId?: bigint, txHash?: string) => void;
};

export function MintButton({ onSuccess }: MintButtonProps) {
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const { mint, hash, isPending, isConfirming, isConfirmed, error } =
    useMint(chainId);
  const { data: saleActive } = usePublicSaleActive(chainId);
  const { data: mintPrice } = useMintPrice(chainId);
  const { data: maxSupply } = useMaxSupply(chainId);

  const [quantity, setQuantity] = useState<number>(MIN_QUANTITY);
  const confirmedRef = useRef(false);

  const price = (mintPrice as bigint) ?? parseEther("0.04");
  const totalCost = price * BigInt(quantity);
  const totalCostDisplay = Number(formatEther(totalCost)).toFixed(4);

  const saleNotActive = saleActive === false;
  const soldOut =
    maxSupply !== undefined && maxSupply !== null && BigInt(maxSupply as bigint) === BigInt(0);

  const isBusy = isPending || isConfirming;
  const isDisabled =
    !isConnected || saleNotActive || soldOut || isBusy;

  useEffect(() => {
    if (isConfirmed && !confirmedRef.current) {
      confirmedRef.current = true;
      toast.success("Minted successfully!");
      onSuccess?.(undefined, hash);
    }
    if (!isConfirmed) {
      confirmedRef.current = false;
    }
  }, [isConfirmed, onSuccess, hash]);

  useEffect(() => {
    if (error) {
      toast.error(error.message ?? "Mint failed");
    }
  }, [error]);

  const decrement = () =>
    setQuantity((q) => Math.max(MIN_QUANTITY, q - 1));
  const increment = () =>
    setQuantity((q) => Math.min(MAX_QUANTITY, q + 1));

  const handleMint = async () => {
    if (!isConnected) {
      toast.error("Connect wallet to mint");
      return;
    }
    if (saleNotActive) {
      toast.error("Sale is not active");
      return;
    }
    try {
      await mint(BigInt(quantity));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Mint failed";
      toast.error(message);
    }
  };

  const renderButtonText = () => {
    if (!isConnected) return "Connect wallet to mint";
    if (saleNotActive) return "Sale Not Active";
    if (soldOut) return "Sold Out";
    if (isPending) return "Confirm in Wallet...";
    if (isConfirming) return "Confirming...";
    if (isConfirmed) return "Minted!";
    return "Mint NFT";
  };

  return (
    <div className="glass-panel flex w-full max-w-md flex-col gap-6 rounded-xl p-6">
      <div className="flex flex-col gap-2">
        <span className="font-mono text-xs uppercase tracking-widest text-outline">
          Quantity
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={decrement}
            disabled={quantity <= MIN_QUANTITY || isBusy}
            aria-label="Decrease quantity"
            className="input-recessed flex size-10 items-center justify-center rounded-lg text-on-surface transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus className="size-4" />
          </button>
          <input
            type="text"
            readOnly
            value={quantity}
            aria-label="Mint quantity"
            className="input-recessed h-10 w-16 rounded-lg text-center font-mono text-lg text-on-surface"
          />
          <button
            type="button"
            onClick={increment}
            disabled={quantity >= MAX_QUANTITY || isBusy}
            aria-label="Increase quantity"
            className="input-recessed flex size-10 items-center justify-center rounded-lg text-on-surface transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-outline-variant/40 pt-4">
        <span className="font-mono text-xs uppercase tracking-widest text-outline">
          Total Cost
        </span>
        <span className="font-heading text-xl text-primary">
          {totalCostDisplay} ETH
        </span>
      </div>

      <button
        type="button"
        onClick={handleMint}
        disabled={isDisabled}
        className="btn-primary flex h-12 w-full items-center justify-center gap-2 rounded-lg font-heading text-base font-semibold disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isBusy && <Loader2 className="size-5 animate-spin" />}
        <span>{renderButtonText()}</span>
        {!isBusy && !isConfirmed && !saleNotActive && !soldOut && (
          <ArrowRight className="size-5" />
        )}
      </button>

      {hash && (
        <a
          href={`https://sepolia.etherscan.io/tx/${hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-center font-mono text-xs text-outline underline-offset-4 hover:text-primary hover:underline"
        >
          View transaction on Etherscan
        </a>
      )}
    </div>
  );
}
