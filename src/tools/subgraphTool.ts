import axios from "axios";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

const getSubgraphUrl = (network: string) => {
  switch (network) {
    case "arbitrum-sepolia":
      return "https://api.studio.thegraph.com/query/62788/rekt-ai-subgraph/version/latest";
    case "base-sepolia":
      return "https://api.studio.thegraph.com/query/62788/rekt-ai-subgraph-base/version/latest";
    default:
      throw new Error("Unsupported network");
  }
};

export const getSubgraphMarketCreatedData = new DynamicStructuredTool({
  name: "getSubgraphMarketCreatedData",
  description: "Get market creation data from The Graph (by default use current network)",
  schema: z.object({
    // network: z
    //   .string()
    //   .describe(
    //     "The network to query (always check current network by default, e.g., arbitrum-sepolia, base-sepolia)",
    //   ),
    deadline_gt: z
      .string()
      .describe(
        "Deadline greater than this value, use the current block timestamp by default if not mentioned by user",
      ),
  }),
  func: async ({ deadline_gt }) => {
    try {
      const networkId = process.env.NETWORK_ID || "base-sepolia";
      const response = await axios.post(getSubgraphUrl(networkId), {
        query: `
          query ($deadline_gt: BigInt!) {
            marketCreateds(
              first: 10
              orderBy: startTime
              orderDirection: desc
              where: { deadline_gt: $deadline_gt }
              skip: 0
            ) {
              id
              marketId
              startTime
              deadline
            }
          }
        `,
        variables: { deadline_gt },
      });

      return JSON.stringify(response.data);
    } catch (error) {
      console.error("Error fetching market creation data:", error);
      return "Error fetching market creation data";
    }
  },
});

export const getSubgraphMarketSettledData = new DynamicStructuredTool({
  name: "getSubgraphMarketSettledData",
  description: "Get market settlement data from The Graph (by default use current network)",
  schema: z.object({
    // network: z
    //   .string()
    //   .describe(
    //     "The network to query (always check current network by default, e.g., arbitrum-sepolia, base-sepolia)",
    //   ),
    blockTimestamp_lt: z
      .string()
      .describe(
        "Block timestamp less than this value, use current block timestamp format plus 1 day",
      ),
    blockTimestamp_gt: z
      .string()
      .describe("Block timestamp greater than this value, use block timestamp"),
    winner_not: z
      .string()
      .describe("Winner address not equal to this value, use my wallet address"),
  }),
  func: async ({ blockTimestamp_lt, blockTimestamp_gt, winner_not }) => {
    try {
      const networkId = process.env.NETWORK_ID || "base-sepolia";
      const response = await axios.post(getSubgraphUrl(networkId), {
        query: `
          query ($blockTimestamp_lt: BigInt!, $blockTimestamp_gt: BigInt!, $winner_not: String!) {
            marketSettleds(
              orderBy: blockTimestamp
              orderDirection: asc
              where: { blockTimestamp_lt: $blockTimestamp_lt, blockTimestamp_gt: $blockTimestamp_gt, winner_not: $winner_not }
              first: 10
            ) {
              id
              marketId
              finalPrice
              predictionPrice
              totalAmount
              winner
            }
          }
        `,
        variables: { blockTimestamp_lt, blockTimestamp_gt, winner_not },
      });

      return JSON.stringify(response.data);
    } catch (error) {
      console.error("Error fetching market settlement data:", error);
      return "Error fetching market settlement data";
    }
  },
});
