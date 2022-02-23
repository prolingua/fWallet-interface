import ftmImage from "../assets/img/chains/Fantom.svg";
import ethImage from "../assets/img/chains/Ethereum.svg";
import bscImage from "../assets/img/chains/BSC.png";
import polyImage from "../assets/img/chains/Polygon.png";
import avaxImage from "../assets/img/chains/Avalanche.png";
import arbImage from "../assets/img/chains/Arbitrum.png";

export const supportedChainsForBridge = [250, 1, 56, 137, 43114, 42161];
export const chainToNetworkInfoMap = {
  250: { symbol: "ftm", name: "Fantom", image: ftmImage },
  1: { symbol: "eth", name: "Ethereum", image: ethImage },
  56: { symbol: "bsc", name: "Binance Smart Chain", image: bscImage },
  137: { symbol: "matic", name: "Polygon", image: polyImage },
  43114: { symbol: "avax", name: "Avalanche", image: avaxImage },
  42161: { symbol: "arb", name: "Arbirtum", image: arbImage },
} as any;
