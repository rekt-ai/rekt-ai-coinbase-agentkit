import { customActionProvider, EvmWalletProvider } from "@coinbase/agentkit";
import { deployedContracts } from "../contracts/deployedContracts";
import { chains } from "../agent";
import { z } from "zod";
import { encodeFunctionData, stringToHex } from "viem";

// Contract name constant
const contractName: string = "RektPredictionMarket";

// Read market details from contract
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

// Create a new prediction market
export const writeCreateMarketContract = customActionProvider<EvmWalletProvider>({
  name: "writeCreateMarket",
  description: "Create a new prediction market",
  schema: z.object({
    marketId: z.string().describe("The market ID"),
    startTime: z.number().describe("Start time in unix timestamp"),
    deadline: z.number().describe("Deadline in unix timestamp"),
    participationFee: z.string().describe("Participation fee in wei"),
    name: z.string().describe("Market name"),
  }),
  invoke: async (walletProvider, args: any) => {
    const networkId = process.env.NETWORK_ID || "base-sepolia";
    const chainId = chains[networkId].id;
    const contract = deployedContracts[chainId][contractName];

    return await walletProvider.sendTransaction({
      to: contract.address as `0x${string}`,
      data: encodeFunctionData({
        abi: contract.abi,
        functionName: "createMarket",
        args: [args.marketId, args.startTime, args.deadline, args.participationFee, args.name],
      }) as `0x${string}`,
    });
  },
});

// Participate in an existing market
export const writeParticipateInMarketContract = customActionProvider<EvmWalletProvider>({
  name: "writeParticipateInMarket",
  description: "Participate in a market by providing a prediction",
  schema: z.object({
    marketId: z.string().describe("The market ID"),
    predictionPrice: z.string().describe("The prediction price"),
    proofData: z.string().optional().describe("Optional proof data"),
  }),
  invoke: async (walletProvider, args: any) => {
    const networkId = process.env.NETWORK_ID || "base-sepolia";
    const chainId = chains[networkId].id;
    const contract = deployedContracts[chainId][contractName];
    const entranceFee = BigInt(1e15); // 0.001 ETH in wei

    return await walletProvider.sendTransaction({
      to: contract.address as `0x${string}`,
      data: encodeFunctionData({
        abi: contract.abi,
        functionName: "participateInMarket",
        args: [args.marketId, args.predictionPrice, args.proofData || ""],
      }) as `0x${string}`,
      value: entranceFee,
    });
  },
});

// Settle a market with final results
export const writeSettleMarketContract = customActionProvider<EvmWalletProvider>({
  name: "writeSettleMarket",
  description: "Settle a market with final price",
  schema: z.object({
    marketId: z.string().describe("The market ID"),
    finalPrice: z.string().describe("The final price"),
    proofData: z.string().optional().describe("Optional proof data"),
  }),
  invoke: async (walletProvider, args: any) => {
    const networkId = process.env.NETWORK_ID || "base-sepolia";
    const chainId = chains[networkId].id;
    const contract = deployedContracts[chainId][contractName];

    return await walletProvider.sendTransaction({
      to: contract.address as `0x${string}`,
      data: encodeFunctionData({
        abi: contract.abi,
        functionName: "settleMarket",
        args: [args.marketId, args.finalPrice, args.proofData || ""],
      }) as `0x${string}`,
    });
  },
});
