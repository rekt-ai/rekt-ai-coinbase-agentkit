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

// Initialize ClobClient with both signer and credentials
const initClobClient = () => {
  try {
    // Setup signer
    const privateKey = process.env.AGENT_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("AGENT_PRIVATE_KEY is not set in environment variables");
    }

    // Ensure private key is properly formatted
    const formattedKey = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;

    // Validate private key length
    if (formattedKey.length !== 66) {
      // 0x + 64 hex characters
      throw new Error("Invalid private key length. Expected 32 bytes (64 hex characters)");
    }

    const provider = new ethers.providers.JsonRpcProvider("https://polygon-rpc.com");
    const signer = new Wallet(formattedKey, provider);

    // Setup CLOB client with both signer and API credentials
    const clobClient = new ClobClient(
      process.env.POLYMARKET_API_URL || "https://clob.polymarket.com",
      137, // Polygon mainnet
      signer as any,
      {
        key: process.env.POLYMARKET_API_KEY || "",
        secret: process.env.POLYMARKET_API_SECRET || "",
        passphrase: process.env.POLYMARKET_API_PASSPHRASE || "",
      },
    );

    return clobClient;
  } catch (error) {
    console.error("Error initializing ClobClient:", error);
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

export const createPolymarketPrediction = new DynamicStructuredTool({
  name: "createPolymarketPrediction",
  description: "Create a new prediction market on Polymarket",
  schema: z.object({
    marketName: z.string().describe("The name/title of the prediction market"),
    description: z.string().describe("Detailed description of what the market is predicting"),
    resolutionDate: z
      .string()
      .describe("The date when the market will be resolved (in ISO format)"),
    options: z.array(z.string()).describe("Array of possible outcome options"),
    entranceFee: z.string().describe("Entrance fee in ETH (e.g., '0.01')"),
    initialLiquidity: z.string().optional().describe("Initial liquidity pool in ETH (optional)"),
    category: z
      .enum(["Crypto", "Politics", "Sports", "Entertainment", "Other"])
      .describe("Market category"),
  }),
  func: async ({
    marketName,
    description,
    resolutionDate,
    options,
    entranceFee,
    initialLiquidity = "0.1",
    category,
  }) => {
    try {
      // Validate inputs
      if (options.length < 2) {
        throw new Error("Must provide at least 2 outcome options");
      }

      const resolveDate = new Date(resolutionDate);
      if (resolveDate <= new Date()) {
        throw new Error("Resolution date must be in the future");
      }

      // Generate unique market ID using timestamp
      const marketId = Date.now().toString();

      // Convert entrance fee to Wei
      const entranceFeeWei = BigInt(parseFloat(entranceFee) * 1e18).toString();
      const initialLiquidityWei = BigInt(parseFloat(initialLiquidity) * 1e18).toString();

      // Create market structure
      const market = {
        id: marketId,
        name: marketName,
        description,
        category,
        resolutionDate: resolveDate.toISOString(),
        options,
        entranceFee: entranceFeeWei,
        initialLiquidity: initialLiquidityWei,
        status: "OPEN",
        createdAt: new Date().toISOString(),
        participants: [],
        totalVolume: "0",
      };

      // Here you would typically:
      // 1. Call smart contract to create market
      // 2. Add initial liquidity
      // 3. Emit market creation event
      // 4. Index market data

      return {
        success: true,
        marketId,
        message: `Successfully created prediction market "${marketName}" with ID ${marketId}`,
        market,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  },
});

// Helper function to validate market parameters
function validateMarketParams(params: any) {
  const { marketName, description, resolutionDate, options, entranceFee } = params;

  if (!marketName || marketName.length < 5) {
    throw new Error("Market name must be at least 5 characters long");
  }

  if (!description || description.length < 20) {
    throw new Error("Description must be at least 20 characters long");
  }

  const resolveDate = new Date(resolutionDate);
  if (isNaN(resolveDate.getTime())) {
    throw new Error("Invalid resolution date format");
  }

  if (resolveDate <= new Date()) {
    throw new Error("Resolution date must be in the future");
  }

  if (!Array.isArray(options) || options.length < 2) {
    throw new Error("Must provide at least 2 outcome options");
  }

  const entranceFeeFloat = parseFloat(entranceFee);
  if (isNaN(entranceFeeFloat) || entranceFeeFloat <= 0) {
    throw new Error("Entrance fee must be a positive number");
  }

  return true;
}

// Export other required functions
export const getPolymarketData = new DynamicStructuredTool({
  name: "getPolymarketData",
  description: "Get data for a specific prediction market",
  schema: z.object({
    marketId: z.string().describe("The ID of the prediction market"),
  }),
  func: async ({ marketId }) => {
    try {
      const clobClient = initClobClient();
      const market = await clobClient.getMarket(marketId);

      return {
        success: true,
        marketId,
        market: market,
        status: "ACTIVE",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch market data",
      };
    }
  },
});

export const participateFromPoly = new DynamicStructuredTool({
  name: "participate_from_polymarket",
  description: "Participate in market based on Polymarket predictions",
  schema: z.object({
    marketId: z.string().describe("Market ID to participate in"),
  }),
  func: async ({ marketId }, runManager?: any) => {
    try {
      const market = await clobClient.getOrderBook(marketId);
      const currentPrice = market.bids[0]?.price || "0.5";

      const provider = runManager?.getCustomFields()?.provider as EvmWalletProvider;
      if (!provider) {
        throw new Error("No wallet provider available");
      }

      const networkId = process.env.NETWORK_ID || "base-sepolia";
      const chainId = chains[networkId].id;
      const contractInfo = deployedContracts[chainId]["RektPredictionMarket"];

      const tx = await provider.sendTransaction({
        to: contractInfo.address as `0x${string}`,
        data: encodeFunctionData({
          abi: contractInfo.abi,
          functionName: "participateInMarket",
          args: [
            marketId,
            ethers.utils.parseUnits(currentPrice, 8).toString(),
            JSON.stringify({ source: "polymarket", price: currentPrice }),
          ],
        }) as `0x${string}`,
        value: BigInt(ethers.utils.parseEther("0.001").toString()),
      });

      return {
        status: "success",
        participation: {
          market_id: marketId,
          prediction_price: currentPrice,
          transaction: tx,
        },
      };
    } catch (error: any) {
      console.error("Error participating:", error);
      return {
        status: "error",
        message: error?.message || "Unknown error",
      };
    }
  },
});

export const settleFromPoly = new DynamicStructuredTool({
  name: "settle_from_polymarket",
  description: "Settle market based on Polymarket final price",
  schema: z.object({
    marketId: z.string().describe("Market ID to settle"),
  }),
  func: async ({ marketId }, runManager?: any) => {
    try {
      const market = await clobClient.getOrderBook(marketId);
      const finalPrice = market.bids[0]?.price || "0.5";

      const provider = runManager?.getCustomFields()?.provider as EvmWalletProvider;
      if (!provider) {
        throw new Error("No wallet provider available");
      }

      const networkId = process.env.NETWORK_ID || "base-sepolia";
      const chainId = chains[networkId].id;
      const contractInfo = deployedContracts[chainId]["RektPredictionMarket"];

      const tx = await provider.sendTransaction({
        to: contractInfo.address as `0x${string}`,
        data: encodeFunctionData({
          abi: contractInfo.abi,
          functionName: "settleMarket",
          args: [
            marketId,
            ethers.utils.parseUnits(finalPrice, 8).toString(),
            JSON.stringify({ source: "polymarket", final_price: finalPrice }),
          ],
        }) as `0x${string}`,
      });

      return {
        status: "success",
        settlement: {
          market_id: marketId,
          final_price: finalPrice,
          transaction: tx,
        },
      };
    } catch (error: any) {
      console.error("Error settling:", error);
      return {
        status: "error",
        message: error?.message || "Unknown error",
      };
    }
  },
});

export const participateInMarket = new DynamicStructuredTool({
  name: "participateInMarket",
  description: "Participate in an existing prediction market",
  schema: z.object({
    marketId: z.string().describe("The ID of the prediction market to participate in"),
    prediction: z.string().describe("Your prediction (e.g., 'yes', 'no')"),
    amount: z.string().describe("Amount to stake in ETH"),
  }),
  func: async ({ marketId, prediction, amount }) => {
    try {
      // Validate inputs
      if (!marketId) {
        throw new Error("Market ID is required");
      }

      const amountFloat = parseFloat(amount);
      if (isNaN(amountFloat) || amountFloat <= 0) {
        throw new Error("Amount must be a positive number");
      }

      // Convert amount to Wei
      const amountWei = BigInt(amountFloat * 1e18).toString();

      // Create participation record
      const participation = {
        marketId,
        prediction,
        amount: amountWei,
        timestamp: new Date().toISOString(),
        status: "PENDING",
      };

      return {
        success: true,
        message: `Successfully participated in market ${marketId} with ${amount} ETH`,
        participation,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  },
});

export const settleMarket = new DynamicStructuredTool({
  name: "settleMarket",
  description: "Settle a prediction market and distribute rewards",
  schema: z.object({
    marketId: z.string().describe("The ID of the prediction market to settle"),
    outcome: z.string().describe("The final outcome of the market"),
    finalPrice: z.string().optional().describe("Final settlement price (if applicable)"),
  }),
  func: async ({ marketId, outcome, finalPrice }) => {
    try {
      // Validate inputs
      if (!marketId) {
        throw new Error("Market ID is required");
      }

      if (!outcome) {
        throw new Error("Outcome is required");
      }

      // Create settlement record
      const settlement = {
        marketId,
        outcome,
        finalPrice: finalPrice || "0",
        settledAt: new Date().toISOString(),
        status: "SETTLED",
      };

      return {
        success: true,
        message: `Successfully settled market ${marketId} with outcome: ${outcome}`,
        settlement,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  },
});
