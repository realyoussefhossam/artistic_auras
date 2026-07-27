import abi from "./abi.json";
import { mainnet } from "wagmi/chains";

export const contractABI = abi;

export const MAINNET_CONTRACT = "0x2A313cB8281205F748DE4E144Ad23C89878497c1";

/** Chain IDs where the contract is deployed. */
export const SUPPORTED_CHAIN_IDS = [mainnet.id] as const;

export function isSupportedChain(chainId: number | undefined): boolean {
  if (chainId === undefined) return false;
  return SUPPORTED_CHAIN_IDS.includes(chainId as (typeof SUPPORTED_CHAIN_IDS)[number]);
}

export function getContractAddress(_chainId: number): `0x${string}` {
  return MAINNET_CONTRACT as `0x${string}`;
}

/** Returns the Etherscan base URL for a given chain ID. */
export function getEtherscanUrl(_chainId: number): string {
  return "https://etherscan.io";
}

/** Returns the OpenSea asset URL for a token on a given chain ID. */
export function getOpenSeaAssetUrl(_chainId: number, contractAddress: string, tokenId: number): string {
  return `https://opensea.io/assets/ethereum/${contractAddress}/${tokenId}`;
}

export { mainnet };
