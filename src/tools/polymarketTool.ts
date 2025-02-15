import dotenv from "dotenv";
import { config } from "dotenv";
import path from "path";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import type { PriceHistoryFilterParams } from "@polymarket/clob-client";
import { Side } from "@polymarket/order-utils";
import type { SignedOrder } from "@polymarket/order-utils";
import { ClobClient } from "@polymarket/clob-client";
import { ethers, Wallet } from "ethers";
import {
  writeCreateMarketContract,
  writeParticipateInMarketContract,
  writeSettleMarketContract,
} from "../actions/RektPredictionMarket";
import type { EvmWalletProvider, CustomActionProvider } from "@coinbase/agentkit";
import { encodeFunctionData } from "viem";
import { chains } from "../agent";
import { deployedContracts } from "../contracts/deployedContracts";
import { setupPolymarketProvider, getWalletProvider } from "../setup/polymarketSetup";

// Load environment variables
config({ path: path.resolve(process.cwd(), ".env") });

// Market cache to store created markets
const marketCache = new Map();

// Helper function to format date correctly
const formatDate = (date: Date): string => {
  return date.toISOString();
};

// Mock functions for simulation
const mockMarketCreation = (marketData: {
  marketId: string;
  marketName: string;
  entranceFee: string;
}) => {
  const now = new Date();
  const deadline = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

  return {
    status: "success",
    marketId: marketData.marketId,
    name: marketData.marketName,
    entranceFee: marketData.entranceFee,
    startTime: now.toISOString(),
    deadline: deadline.toISOString(),
    createdAt: now.toISOString(),
    orders: {
      bids: [],
      asks: [],
    },
  };
};

const mockParticipation = (data: { marketId: string; prediction: string; amount: string }) => {
  return {
    status: "success",
    marketId: data.marketId,
    prediction: data.prediction,
    amount: data.amount,
    timestamp: new Date().toISOString(),
  };
};

const mockSettlement = (data: { marketId: string; finalPrice: string }) => {
  return {
    status: "success",
    marketId: data.marketId,
    finalPrice: data.finalPrice,
    settledAt: new Date().toISOString(),
  };
};

const mockMarketData = (marketId: string) => {
  return {
    status: "active",
    marketId,
    currentPrice: "1.0",
    volume: "0",
    lastUpdated: new Date().toISOString(),
  };
};

// Helper function to generate market ID
const generateMarketId = (prefix: string = "REKT") => {
  const timestamp = Date.now();
  return `${prefix}_${timestamp}`;
};

// Initialize CLOB client with better error handling
const initClobClient = () => {
  try {
    const privateKey = process.env.AGENT_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("AGENT_PRIVATE_KEY is not set");
    }

    const formattedKey = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;
    if (formattedKey.length !== 66) {
      throw new Error("Invalid private key length");
    }

    const provider = new ethers.providers.JsonRpcProvider(
      process.env.RPC_URL || "https://polygon-rpc.com",
    );
    const signer = new Wallet(formattedKey, provider);

    return new ClobClient(
      process.env.POLYMARKET_API_URL || "https://clob.polymarket.com",
      137,
      signer as any,
      {
        key: process.env.POLYMARKET_API_KEY || "",
        secret: process.env.POLYMARKET_API_SECRET || "",
        passphrase: process.env.POLYMARKET_API_PASSPHRASE || "",
      },
    );
  } catch (error) {
    console.error("ClobClient initialization error:", error);
    throw error;
  }
};

// Initialize CLOB client
const clobClient = initClobClient();

export const getAllMarkets = new DynamicStructuredTool({
  name: "get_all_markets",
  description: "Get all active markets from Polymarket",
  schema: z.object({}),
  func: async () => {
    try {
      const response = await clobClient.getMarkets();

      if (!response || !response.data) {
        return {
          status: "error",
          message: "No market data received",
        };
      }

      // Format the response to be more readable
      const formattedMarkets = response.data.map(market => ({
        id: market.condition_id,
        name: market.question,
        status: market.active ? "Active" : "Closed",
        end_date: new Date(market.end_date_iso).toLocaleDateString(),
        options: market.tokens.map(token => ({
          outcome: token.outcome,
          price: parseFloat(token.price).toFixed(4),
        })),
      }));

      return {
        status: "success",
        count: formattedMarkets.length,
        markets: formattedMarkets.slice(0, 5), // Limit to 5 markets for readability
        message: `Found ${formattedMarkets.length} active markets`,
      };
    } catch (error) {
      return {
        status: "error",
        message: error instanceof Error ? error.message : "Failed to fetch markets",
      };
    }
  },
});

// Create prediction market with better validation
export const createPolymarketPrediction = new DynamicStructuredTool({
  name: "createPolymarketPrediction",
  description: "Create a new prediction market",
  schema: z.object({
    marketName: z.string().min(5, "Market name must be at least 5 characters"),
    description: z.string().min(20, "Description must be at least 20 characters"),
    resolutionDate: z.string(),
    entranceFee: z.string(),
    category: z.enum(["Crypto", "Politics", "Sports", "Entertainment", "Other"]),
  }),
  func: async ({ marketName, description, resolutionDate, entranceFee, category }) => {
    try {
      // Validate resolution date
      const deadline = new Date(resolutionDate);
      if (deadline <= new Date()) {
        throw new Error("Resolution date must be in the future");
      }

      // Validate entrance fee
      const feeEth = parseFloat(entranceFee);
      if (isNaN(feeEth) || feeEth < 0.001 || feeEth > 0.1) {
        throw new Error("Entrance fee must be between 0.001 and 0.1 ETH");
      }

      // Generate unique market ID
      const marketId = `REKT_${Date.now()}`;

      // Create market data
      const marketData = {
        id: marketId,
        name: marketName,
        description,
        category,
        deadline: deadline.toISOString(),
        entranceFee: ethers.utils.parseEther(entranceFee).toString(),
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
      };

      // Store in cache
      marketCache.set(marketId, marketData);

      return {
        success: true,
        marketId,
        market: marketData,
        message: `Successfully created market "${marketName}"`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Market creation failed",
      };
    }
  },
});

// Get market data with cache support
export const getPolymarketData = new DynamicStructuredTool({
  name: "getPolymarketData",
  description: "Get market details",
  schema: z.object({
    marketId: z.string(),
  }),
  func: async ({ marketId }) => {
    try {
      // Check cache first
      if (marketCache.has(marketId)) {
        return {
          success: true,
          market: marketCache.get(marketId),
        };
      }

      // If not in cache, try Polymarket API
      const clobClient = initClobClient();
      const market = await clobClient.getMarket(marketId);

      return {
        success: true,
        market,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch market data",
      };
    }
  },
});

// Participate in market with validation
export const participateInMarket = new DynamicStructuredTool({
  name: "participateInMarket",
  description: "Participate in prediction market",
  schema: z.object({
    marketId: z.string(),
    prediction: z.string(),
    amount: z.string(),
  }),
  func: async ({ marketId, prediction, amount }) => {
    try {
      // Validate market exists
      if (!marketCache.has(marketId)) {
        throw new Error("Market not found");
      }

      // Validate amount
      const amountEth = parseFloat(amount);
      if (isNaN(amountEth) || amountEth <= 0) {
        throw new Error("Invalid amount");
      }

      const participation = {
        marketId,
        prediction,
        amount: ethers.utils.parseEther(amount).toString(),
        timestamp: new Date().toISOString(),
      };

      return {
        success: true,
        participation,
        message: `Successfully participated with ${amount} ETH`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Participation failed",
      };
    }
  },
});

// Settle market with validation
export const settleMarket = new DynamicStructuredTool({
  name: "settleMarket",
  description: "Settle market with final outcome",
  schema: z.object({
    marketId: z.string(),
    finalPrice: z.string(),
  }),
  func: async ({ marketId, finalPrice }) => {
    try {
      // Validate market exists
      if (!marketCache.has(marketId)) {
        throw new Error("Market not found");
      }

      const market = marketCache.get(marketId);

      // Validate market can be settled
      const deadline = new Date(market.deadline);
      if (deadline > new Date()) {
        throw new Error("Market cannot be settled before deadline");
      }

      const settlement = {
        marketId,
        finalPrice,
        settledAt: new Date().toISOString(),
      };

      return {
        success: true,
        settlement,
        message: `Market settled with final price ${finalPrice}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Settlement failed",
      };
    }
  },
});
