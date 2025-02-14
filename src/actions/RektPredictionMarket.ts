import { customActionProvider, EvmWalletProvider } from "@coinbase/agentkit";
import { parseUnits, encodeFunctionData, stringToHex } from "viem";
import { deployedContracts } from "../contracts/deployedContracts";
import { chains } from "../agent";
import { z } from "zod";

const contractName: string = "RektPredictionMarket";

export const readMarketsContract = customActionProvider<EvmWalletProvider>({
  name: "readMarketsContract",
  description:
    "read certain created market details when you know the market ID from the graph and still not greater than the deadline",
  schema: z.object({
    marketId: z.string().describe("The market ID"),
  }),
  invoke: async (walletProvider, args: any) => {
    const addr = walletProvider.getAddress();
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
      functionName: "getMarketPhase",
      args: [marketId],
    })) as number;

    const playerData: any = await walletProvider.readContract({
      abi: contractABI,
      address: contractAddress as `0x${string}`,
      functionName: "getPlayerData",
      args: [marketId, addr],
    });

    const isPredictedByAI: any = playerData[0].toString() !== "0";

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
    "create a new market by specifying deadline, participation fee, and a creative market name",
  schema: z.object({
    deadline: z
      .number()
      .optional()
      .default(7)
      .describe(
        "The market's deadline in days, set on-chain to represent the end of the prediction phase (7 days from current date by default)",
      ),
    participationFee: z
      .string()
      .optional()
      .default("0.001") // Default to 0.0001 ETH
      .transform(value => {
        const fee = parseFloat(value);
        if (fee >= 0.001 && fee <= 0.005) {
          return value; // Use the valid fee
        }
        return "0.001"; // Fallback to default value
      })
      .describe(
        "The participation fee for the market specified in ether. The maximum fee is 0.0005 ETH and the minimum fee is 0.0001 ETH.",
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
    const { deadline, participationFee, name } = args;
    const contract = deployedContracts[chainId][contractName];
    const contractAddress = contract.address;
    const contractABI = contract.abi;

    const parsedParticipationFee = parseUnits(participationFee, 18); // Convert to wei
    console.log("Participation Fee (Wei):", parsedParticipationFee);

    const adjustedDeadline = deadline < 3 || deadline > 30 ? 7 : deadline;
    if (adjustedDeadline !== deadline) {
      console.warn("Deadline out of range. Defaulting to 7 days.");
    }

    const currentDateTimestamp = Math.floor(Date.now() / 1000); // This mimics the block.timestamp format in blockchain, which is in seconds since Unix epoch
    const deadlineTimestamp = currentDateTimestamp + adjustedDeadline * 24 * 60 * 60;

    return await walletProvider.sendTransaction({
      to: contractAddress as `0x${string}`,
      data: encodeFunctionData({
        abi: contractABI,
        functionName: "createMarket",
        args: [0n, deadlineTimestamp, parsedParticipationFee.toString(), name],
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
    entranceFee: z
      .string()
      .optional()
      .default("0.001") // Default to 0.0001 ETH
      .transform(value => {
        const fee = parseFloat(value);
        if (fee >= 0.001 && fee <= 0.005) {
          return value; // Use the valid fee
        }
        return "0.001"; // Fallback to default value
      })
      .describe(
        "The participation fee for the market specified in ether. The maximum fee is 0.0005 ETH and the minimum fee is 0.0001 ETH.",
      ),
  }),
  invoke: async (walletProvider, args: any) => {
    const networkId = process.env.NETWORK_ID || "base-sepolia";
    const chainId = chains[networkId].id;
    const { marketId, predictionPrice, entranceFee } = args;
    const contract = deployedContracts[chainId][contractName];
    const contractAddress = contract.address;
    const contractABI = contract.abi;

    const bytes32Value = stringToHex("", { size: 32 });

    const entranceFeeInWei = parseUnits(entranceFee, 18); // Convert entrance fee to wei
    console.log("Entrance Fee (Wei):", entranceFeeInWei);

    return await walletProvider.sendTransaction({
      to: contractAddress as `0x${string}`,
      data: encodeFunctionData({
        abi: contractABI,
        functionName: "participateInMarket",
        args: [marketId, predictionPrice, bytes32Value],
      }),
      value: entranceFeeInWei,
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
