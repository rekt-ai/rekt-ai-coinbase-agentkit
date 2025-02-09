import { DynamicStructuredTool } from "@langchain/core/tools";
import axios from "axios";
import { z } from "zod";

export const getChatData = new DynamicStructuredTool({
  name: "getChatData",
  description: "Get chat data based on market ID and user address",
  schema: z.object({
    marketId: z.string().describe("Market ID to filter the data"),
    userAddress: z.string().describe("User address to filter the data"),
  }),
  func: async ({ marketId, userAddress }) => {
    try {
      const networkId = process.env.NETWORK_ID || "base-sepolia";
      const response = await axios.post(`https://api.example.com/chatData`, {
        networkId,
        marketId,
        userAddress,
      });

      return JSON.stringify(response.data);
    } catch (error) {
      console.error("Error fetching chat data:", error);
      return "Error fetching chat data";
    }
  },
});

export const insertChatData = new DynamicStructuredTool({
  name: "insertChatData",
  description: "Insert chat data into the system",
  schema: z.object({
    marketId: z.string().describe("Market ID to filter the data"),
    walletAddress: z.string().describe("My wallet address"),
    chat: z.string().describe("Chat is a string"),
  }),
  func: async ({ marketId, walletAddress, chat }) => {
    try {
      const networkId = process.env.NETWORK_ID || "base-sepolia";
      const response = await axios.post(`https://api.example.com/insertChat`, {
        networkId,
        marketId,
        walletAddress,
        chat,
      });

      return JSON.stringify(response.data);
    } catch (error) {
      console.error("Error inserting chat data:", error);
      return "Error inserting chat data";
    }
  },
});
