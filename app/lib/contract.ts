import abi from "./abi.json";
import { sepolia, mainnet } from "wagmi/chains";

export const contractABI = abi;

export const SEPOLIA_CONTRACT = "0xC800B15856b3711f433F51aaE8BEe6AA9c090Ad5";
const MAINNET_CONTRACT = "0x0000000000000000000000000000000000000000"; // TBD

/** Chain IDs where the contract is deployed. */
export const SUPPORTED_CHAIN_IDS = [sepolia.id] as const;

export function isSupportedChain(chainId: number | undefined): boolean {
  if (chainId === undefined) return false;
  return SUPPORTED_CHAIN_IDS.includes(chainId as (typeof SUPPORTED_CHAIN_IDS)[number]);
}

export function getContractAddress(chainId: number): `0x${string}` {
  if (chainId === sepolia.id) return SEPOLIA_CONTRACT as `0x${string}`;
  if (chainId === mainnet.id) return MAINNET_CONTRACT as `0x${string}`;
  return SEPOLIA_CONTRACT as `0x${string}`;
}

/** Returns the Etherscan base URL for a given chain ID. */
export function getEtherscanUrl(chainId: number): string {
  if (chainId === mainnet.id) return "https://etherscan.io";
  return "https://sepolia.etherscan.io";
}

/** Returns the OpenSea asset URL for a token on a given chain ID. */
export function getOpenSeaAssetUrl(chainId: number, contractAddress: string, tokenId: number): string {
  if (chainId === mainnet.id) {
    return `https://opensea.io/assets/ethereum/${contractAddress}/${tokenId}`;
  }
  return `https://testnets.opensea.io/assets/sepolia/${contractAddress}/${tokenId}`;
}

export { sepolia, mainnet };
