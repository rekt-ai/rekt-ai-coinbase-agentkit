import { customActionProvider, EvmWalletProvider } from "@coinbase/agentkit";
import { deployedContracts } from "../contracts/deployedContracts";
import { z } from "zod";

export const readRektMarketContract = customActionProvider<EvmWalletProvider>({
  // wallet types specify which providers can use this action. It can be as generic as WalletProvider or as specific as CdpWalletProvider
  name: "read_markets",
  description:
    "read certain created market when you know the market ID from the graph and still not greater than the deadline",
  schema: z.object({
    marketId: z.string().describe("The market ID"),
    chainId: z.string().describe("The chain ID of the network (e.g. 84532)"),
  }),
  invoke: async (walletProvider, args: any) => {
    const { marketId, chainId } = args;
    const contract = deployedContracts[chainId]["RektPredictionMarket"];
    const contractAddress = contract.address;
    const contractABI = contract.abi;

    const result = await walletProvider.readContract({
      abi: contractABI,
      address: contractAddress as `0x${string}`,
      functionName: "markets",
      args: [marketId],
    });
    return result;
  },
});
