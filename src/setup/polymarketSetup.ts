import { ethers } from "ethers";
import { ClobClient } from "@polymarket/clob-client";
import type { EvmWalletProvider } from "@coinbase/agentkit";
import type { Chain } from "viem";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize CLOB client with error handling
export const initClobClient = () => {
  try {
    if (!process.env.POLYMARKET_API_URL) {
      throw new Error("POLYMARKET_API_URL is not set");
    }

    // Add null checks and default values for API credentials
    const apiKey = process.env.POLYMARKET_API_KEY ?? "";
    const apiSecret = process.env.POLYMARKET_API_SECRET ?? "";
    const apiPassphrase = process.env.POLYMARKET_API_PASSPHRASE ?? "";

    return new ClobClient(
      process.env.POLYMARKET_API_URL,
      137, // Polygon network
      undefined,
      {
        key: apiKey,
        secret: apiSecret,
        passphrase: apiPassphrase,
      },
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error("Failed to initialize CLOB client:", error.message);
    }
    throw error;
  }
};

// Setup Polymarket provider with validation
export const setupPolymarketProvider = (provider: EvmWalletProvider) => {
  try {
    if (!provider) {
      throw new Error("No wallet provider available");
    }

    const clobClient = initClobClient();

    return {
      provider,
      clobClient,
      isInitialized: true,
    };
  } catch (error) {
    console.error("Failed to setup Polymarket provider:", error);
    throw error;
  }
};

// Get wallet provider with validation
export const getWalletProvider = async (agentProvider: EvmWalletProvider) => {
  try {
    if (!agentProvider) {
      throw new Error("No wallet provider available from agent");
    }

    // Validate provider has required methods
    const requiredMethods = ["getAddress", "sendTransaction", "readContract"];
    for (const method of requiredMethods) {
      if (typeof agentProvider[method] !== "function") {
        throw new Error(`Provider missing required method: ${method}`);
      }
    }

    return agentProvider;
  } catch (error) {
    console.error("Failed to get wallet provider:", error);
    throw error;
  }
};
