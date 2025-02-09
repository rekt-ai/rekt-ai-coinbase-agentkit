import { customActionProvider, EvmWalletProvider } from "@coinbase/agentkit";
import { deployedContracts } from "../contracts/deployedContracts";
import { chains } from "../agent";
import { z } from "zod";
import { encodeFunctionData, stringToHex } from "viem";

const contractName: string = "RektPredictionMarket";

export const readMarketsContract = customActionProvider<EvmWalletProvider>({
  name: "readMarketsContract",
  description:
    "read certain created market details when you know the market ID from the graph and still not greater than the deadline",
  schema: z.object({
    marketId: z.string().describe("The market ID"),
  }),
  invoke: async (walletProvider, args: any) => {
    const networkId = process.env.NETWORK_ID || "base-sepolia";
    const chainId = chains[networkId].id;
    const { marketId } = args;
    const contract = deployedContracts[chainId][contractName];
    const contractAddress = contract.address;
    const contractABI = contract.abi;

    const rawResult: any = await walletProvider.readContract({
      abi: contractABI,
      address: contractAddress as `0x${string}`,
      functionName: "markets",
      args: [marketId],
    });

    const phaseEnum = ["PREDICTION", "LOCK", "SETTLEMENT"];
    const phaseIndex: number = (await walletProvider.readContract({
      abi: contractABI,
      address: contractAddress as `0x${string}`,
      functionName: "getPlayerData",
      args: [marketId],
    })) as number;

    const playerData: any = await walletProvider.readContract({
      abi: contractABI,
      address: contractAddress as `0x${string}`,
      functionName: "getPlayerData",
      args: [marketId, , walletProvider.getAddress()],
    });

    const isPredictedByAI: any = playerData[0].toString() === "0";

    return JSON.stringify({
      startTime: rawResult[0].toString(),
      deadline: rawResult[1].toString(),
      entranceFee: rawResult[2].toString(),
      finalPrice: rawResult[3].toString(),
      totalAmount: rawResult[4].toString(),
      settled: rawResult[5].toString(),
      name: rawResult[6].toString(),
      phase: phaseEnum[phaseIndex],
      isPredictedByAI,
    });
  },
});

export const writeCreateMarketContract = customActionProvider<EvmWalletProvider>({
  name: "writeCreateMarket",
  description:
    "create a new market by specifying the market ID, start time, deadline, participation fee, and a creative market name",
  schema: z.object({
    marketId: z.string().describe("The market ID, generated to ensure uniqueness"),
    startTime: z
      .number()
      .describe(
        "The start time of the market as a block timestamp, set on-chain to the current block timestamp by default",
      ),
    deadline: z
      .number()
      .describe(
        "The market's deadline as a block timestamp, set on-chain to represent the end of the prediction phase (e.g., 7 days from now by default)",
      ),
    participationFee: z
      .string()
      .describe(
        "The participation fee for the market specified in ether (18 decimals). The minimum fee is 0.0001 ETH, which should be converted to wei for transactions and represented as a bigint.",
      ),
    name: z
      .string()
      .describe(
        "An imaginative title for the market, indicating the asset to be forecasted (e.g., 'BTC Price Prediction Challenge vs AI'). Not restricted to BTC, you can choose ETH, DOGE, or any other single asset.",
      ),
  }),
  invoke: async (walletProvider, args: any) => {
    const networkId = process.env.NETWORK_ID || "base-sepolia";
    const chainId = chains[networkId].id;
    const { marketId, startTime, deadline, participationFee, name } = args;
    const contract = deployedContracts[chainId][contractName];
    const contractAddress = contract.address;
    const contractABI = contract.abi;

    return await walletProvider.sendTransaction({
      to: contractAddress as `0x${string}`,
      data: encodeFunctionData({
        abi: contractABI,
        functionName: "createMarket",
        args: [marketId, startTime, deadline, participationFee, name],
      }),
    });
  },
});

export const writeParticipateInMarketContract = customActionProvider<EvmWalletProvider>({
  name: "writeParticipateInMarket",
  description:
    "participate in a market by providing a prediction price and ensuring the market is in the prediction phase",
  schema: z.object({
    marketId: z.string().describe("The market ID"),
    predictionPrice: z
      .string()
      .describe(
        "The prediction price for the market, input as an integer with 8 additional decimals (e.g., $100,000 as 10000000000000)",
      ),
    entranceFee: z.string().describe("The entrance fee for the market"),
  }),
  invoke: async (walletProvider, args: any) => {
    const networkId = process.env.NETWORK_ID || "base-sepolia";
    const chainId = chains[networkId].id;
    const { marketId, predictionPrice, entranceFee } = args;
    const contract = deployedContracts[chainId][contractName];
    const contractAddress = contract.address;
    const contractABI = contract.abi;

    const bytes32Value = stringToHex("", { size: 32 });

    return await walletProvider.sendTransaction({
      to: contractAddress as `0x${string}`,
      data: encodeFunctionData({
        abi: contractABI,
        functionName: "participateInMarket",
        args: [marketId, predictionPrice, bytes32Value],
      }),
      value: entranceFee, // Assuming no ETH is required to participate, adjust if needed
    });
  },
});

export const writeSettleMarketContract = customActionProvider<EvmWalletProvider>({
  name: "writeSettleMarket",
  description:
    "settle a market by providing the final price and ensuring the market is in the settlement phase",
  schema: z.object({
    marketId: z.string().describe("The market ID"),
    finalPrice: z
      .string()
      .describe(
        "The final price for the market, input as an integer with 8 additional decimals (e.g., $100,000 as 10000000000000)",
      ),
  }),
  invoke: async (walletProvider, args: any) => {
    const networkId = process.env.NETWORK_ID || "base-sepolia";
    const chainId = chains[networkId].id;
    const { marketId, finalPrice } = args;
    const contract = deployedContracts[chainId][contractName];
    const contractAddress = contract.address;
    const contractABI = contract.abi;

    return await walletProvider.sendTransaction({
      to: contractAddress as `0x${string}`,
      data: encodeFunctionData({
        abi: contractABI,
        functionName: "settleMarket",
        args: [marketId, finalPrice],
      }),
    });
  },
});
