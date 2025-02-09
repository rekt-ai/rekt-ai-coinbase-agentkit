import axios from "axios";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

export const getBinanceMarketData = new DynamicStructuredTool({
  name: "getBinanceMarketData",
  description: "Get historical market data from Binance",
  schema: z.object({
    symbol: z.string().describe("The trading pair symbol (e.g., BTCUSDT)"),
    interval: z.string().optional().default("1d").describe("Time interval (e.g., 1h, 4h, 1d)"),
    limit: z.number().optional().default(24).describe("Number of candles to fetch"),
  }),
  func: async ({ symbol, interval = "1d", limit = 24 }) => {
    try {
      const response = await axios.get(`https://api.binance.com/api/v3/klines`, {
        params: {
          symbol: symbol.toUpperCase(),
          interval,
          limit,
        },
        headers: {
          "X-MBX-APIKEY": process.env.BINANNCE_MARKET_DATA_API_KEY,
        },
      });

      return JSON.stringify({
        raw_data: response.data,
        extracted_metrics: {
          high: response.data[0][2],
          low: response.data[0][3],
          change_percent: (
            ((response.data[0][4] - response.data[0][1]) / response.data[0][1]) *
            100
          ).toFixed(2),
          timestamp: response.data[0][0],
        },
      });
    } catch (error) {
      console.error("Error fetching Binance data:", error);
      return "Error fetching market data";
    }
  },
});
