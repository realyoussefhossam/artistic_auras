import abi from "./abi.json";
import { sepolia, mainnet } from "wagmi/chains";

export const contractABI = abi;

const SEPOLIA_CONTRACT = "0xC800B15856b3711f433F51aaE8BEe6AA9c090Ad5";
const MAINNET_CONTRACT = "0x0000000000000000000000000000000000000000"; // TBD

export function getContractAddress(chainId: number): `0x${string}` {
  if (chainId === mainnet.id) return MAINNET_CONTRACT as `0x${string}`;
  return SEPOLIA_CONTRACT as `0x${string}`;
}

export { sepolia, mainnet };
