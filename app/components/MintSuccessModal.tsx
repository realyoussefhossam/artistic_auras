"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useChainId } from "wagmi";
import { getEtherscanUrl } from "@/lib/contract";

type MintSuccessModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tokenId?: bigint;
  txHash?: string;
};

export function MintSuccessModal({
  open,
  onOpenChange,
  tokenId,
  txHash,
}: MintSuccessModalProps) {
  const chainId = useChainId();
  const etherscanUrl = txHash
    ? `${getEtherscanUrl(chainId)}/tx/${txHash}`
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="card w-full max-w-sm rounded-lg p-6">
        <DialogHeader className="items-center text-center">
          <div className="mb-2 flex size-14 items-center justify-center rounded-full bg-accent/10">
            <CheckCircle2 className="size-8 text-accent" />
          </div>
          <DialogTitle className="font-heading text-2xl font-black text-primary">
            Aura Minted!
          </DialogTitle>
          <DialogDescription className="text-secondary">
            Your NFT has been successfully minted to your wallet.
          </DialogDescription>
        </DialogHeader>

        {tokenId !== undefined && (
          <div className="flex items-center justify-between rounded-lg border border-border-default bg-surface px-4 py-3">
            <span className="text-xs uppercase tracking-widest text-muted">
              Token ID
            </span>
            <span className="font-heading text-lg font-black text-primary">
              #{tokenId.toString()}
            </span>
          </div>
        )}

        {etherscanUrl && (
          <Button
            variant="outline"
            size="lg"
            className="mt-2 h-11 w-full font-heading"
            render={
              <a
                href={etherscanUrl}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            View on Etherscan
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
