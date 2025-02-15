import { ethers } from "ethers";
import { ClobClient } from "@polymarket/clob-client";
import type { EvmWalletProvider } from "@coinbase/agentkit";
import type { Chain } from "viem";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize CLOB client
export const initClobClient = () => {
  return new ClobClient(process.env.POLYMARKET_API_URL || "https://clob.polymarket.com", 137);
};

// Setup Polymarket provider with wallet provider
export const setupPolymarketProvider = (provider: EvmWalletProvider) => {
  if (!provider) {
    throw new Error("No wallet provider available");
  }
  return {
    provider,
    clobClient: initClobClient(),
  };
};

// Get wallet provider from agent
export const getWalletProvider = async (agentProvider: EvmWalletProvider) => {
  if (!agentProvider) {
    throw new Error("No wallet provider available from agent");
  }
  return agentProvider;
};
