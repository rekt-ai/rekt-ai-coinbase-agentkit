import {
  AgentKit,
  CdpWalletProvider,
  wethActionProvider,
  walletActionProvider,
  erc20ActionProvider,
  cdpApiActionProvider,
  cdpWalletActionProvider,
  pythActionProvider,
  ViemWalletProvider,
} from "@coinbase/agentkit";
import { getLangChainTools } from "@coinbase/agentkit-langchain";
import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as readline from "readline";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrumSepolia, baseSepolia } from "viem/chains";
import { getBinanceMarketData } from "./tools/binanceTool";
import { getSubgraphMarketCreatedData, getSubgraphMarketSettledData } from "./tools/subgraphTool";
import {
  readMarketDetails,
  readNextMarketId,
  writeCreateMarketContract,
  writeParticipateInMarketContract,
  writeSettleMarketContract,
} from "./actions/RektPredictionMarket";

dotenv.config();

/**
 * Validates that required environment variables are set
 *
 * @throws {Error} - If required environment variables are missing
 * @returns {void}
 */
export function validateEnvironment(): void {
  const missingVars: string[] = [];

  // Check required variables
  const requiredVars = [
    "OPENROUTER_API_KEY",
    "OPENROUTER_BASE_URL",
    "CDP_API_KEY_NAME",
    "CDP_API_KEY_PRIVATE_KEY",
    "BINANNCE_MARKET_DATA_API_KEY",
    "AGENT_PRIVATE_KEY",
    // Try with open AI
    "OPENAI_API_KEY",
  ];
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  // Exit if any required variables are missing
  if (missingVars.length > 0) {
    console.error("Error: Required environment variables are not set");
    missingVars.forEach(varName => {
      console.error(`${varName}=your_${varName.toLowerCase()}_here`);
    });
    process.exit(1);
  }

  // Warn about optional NETWORK_ID
  if (!process.env.NETWORK_ID) {
    console.warn("Warning: NETWORK_ID not set, defaulting to base-sepolia testnet");
  }
}

// Add this right after imports and before any other code
validateEnvironment();

// Configure a file to persist the agent's CDP MPC Wallet Data
const WALLET_DATA_FILE = "wallet_data.txt";

export const chains = {
  "base-sepolia": baseSepolia,
  "arbitrum-sepolia": arbitrumSepolia,
};

/**
 * Initialize the agent with CDP Agentkit
 *
 * @returns Agent executor and config
 */
export async function initializeAgent() {
  try {
    // Initialize LLM
    const llm = new ChatOpenAI({
      model: "gpt-4o-mini",
      openAIApiKey: process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY,
      // configuration: {
      //   baseURL: process.env.OPENAI_API_KEY ? "https://api.openai.com/v1" : process.env.OPENROUTER_BASE_URL,
      // },
    });

    let walletDataStr: string | null = null;

    // Read existing wallet data if available
    if (fs.existsSync(WALLET_DATA_FILE)) {
      try {
        walletDataStr = fs.readFileSync(WALLET_DATA_FILE, "utf8");
      } catch (error) {
        console.error("Error reading wallet data:", error);
        // Continue without wallet data
      }
    }

    // Configure CDP Wallet Provider
    const config = {
      apiKeyName: process.env.CDP_API_KEY_NAME,
      apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      cdpWalletData: walletDataStr || undefined,
      networkId: process.env.NETWORK_ID || "base-sepolia",
    };

    const networkId = process.env.NETWORK_ID || "base-sepolia";

    const account = privateKeyToAccount(process.env.AGENT_PRIVATE_KEY as `0x${string}`);
    const walletClient = createWalletClient({
      account,
      chain: chains[networkId],
      transport: http(),
    });
    const walletProvider = new ViemWalletProvider(walletClient);

    // const walletProvider = await CdpWalletProvider.configureWithWallet(config);

    // Initialize AgentKit
    const agentkit = await AgentKit.from({
      walletProvider,
      actionProviders: [
        wethActionProvider(),
        pythActionProvider(),
        walletActionProvider(),
        erc20ActionProvider(),
        cdpApiActionProvider({
          apiKeyName: process.env.CDP_API_KEY_NAME,
          apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
        cdpWalletActionProvider({
          apiKeyName: process.env.CDP_API_KEY_NAME,
          apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
        readNextMarketId,
        readMarketDetails,
        writeCreateMarketContract,
        writeParticipateInMarketContract,
        writeSettleMarketContract,
      ],
    });

    const tools = await getLangChainTools(agentkit);

    // Store buffered conversation history in memory
    const memory = new MemorySaver();
    const agentConfig = {
      configurable: { thread_id: "CDP AgentKit Chatbot Example!" },
    };

    // Create React Agent using the LLM and CDP AgentKit tools
    const today = new Date();
    const agent = createReactAgent({
      llm,
      tools: [
        ...tools,
        getBinanceMarketData,
        getSubgraphMarketCreatedData,
        getSubgraphMarketSettledData,
      ],
      checkpointSaver: memory,
      messageModifier: `
        You are REKT-AI (Risk Evaluation Knockout Tournament - AI), a competitor in prediction markets that:
        1. Learns from user prediction methods
        2. Analyzes market data comprehensively
        3. Provides reasoning for predictions
        4. Adapts strategies based on success rate
        
        When someone asks who or what you are, always introduce yourself as:
        "I am REKT-AI (Risk Evaluation Knockout Tournament - AI), an AI competitor in prediction markets that learns from and competes with users in market predictions."
        
        When making predictions:
        - Use both technical and fundamental analysis
        - Consider user-provided methods
        - Explain your prediction strategy
        - Learn from successful predictions
        
        Always respond in English by default unless specifically requested to use another language.
        Ensure your analysis is concise and data-driven.

        Steps for creating a new market, this is an automated process, so no user input is needed.
      - Always use default settings for actions or sequences of actions.
      - Collect data on assets you are confident in predicting, including their current prices (at least 10 assets).
      - Ignore all the price that below $0.0001 cause it will got variable limitation
      - Define the prediction timeframe for the market (between 7 and 30 days).
      - Make predictions for the asset based on the defined timeframe. If there is an error when retrieving market data, use your own prediction
      - Create a new market using the current date. Initiate a market for the asset (e.g. DOGE, BTC, ETH, etc). Set the deadline to be based on the timeframe before (use timestamp). 
      - Execute the market creation
      - Remember on how many market you created
      - Check the next order ID, for the example if the next market ID is 10 and you created 4 recently, then markets 6 through 9 are the ones you recently created.
      - Based on your prediction, participate the market
      - Execute the market participation

      Steps for participate the market if not created by AI 
      - Always utilize default configurations for actions or sequences of actions.
      - check query from market created, get all of the market details queried by it, and if it is not predited by AI, then you will participate the market if the name is make sense
      - predict the market price you want to participate
      - After that, participate the market

      Steps for settle the market
      - check if market already createds and already past deadline
      - get the current marekt prices from the list of created market that past the deadline
      - settle all the those markets with this price

        Your additional capabilities include interacting with the RektPredictionMarket smart contract (read, write, etc.) and querying the subgraph related to this contract
        
        Additional data, Today is ${today.toDateString()}, this is to know when today is.
        Example for Epoch timestamp: 1739104854 is Date and time (GMT): Sunday, February 9, 2025 12:40:54 PM, so make it sure to calculate accurate timestamp
        `,
    });

    // Save wallet data
    // const exportedWallet = await walletProvider.exportWallet();
    // fs.writeFileSync(WALLET_DATA_FILE, JSON.stringify(exportedWallet));

    return { agent, config: agentConfig };
  } catch (error) {
    console.error("Failed to initialize agent:", error);
    throw error; // Re-throw to be handled by caller
  }
}

/**
 * Run the agent autonomously with specified intervals
 *
 * @param agent - The agent executor
 * @param config - Agent configuration
 * @param interval - Time interval between actions in seconds
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function runAutonomousMode(agent: any, config: any, interval = 10) {
  console.log("Starting autonomous mode...");

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const thought =
        "Be creative and do something interesting on the blockchain. " +
        "Choose an action or set of actions and execute it that highlights your abilities.";

      const stream = await agent.stream({ messages: [new HumanMessage(thought)] }, config);

      for await (const chunk of stream) {
        if ("agent" in chunk) {
          console.log(chunk.agent.messages[0].content);
        } else if ("tools" in chunk) {
          console.log(chunk.tools.messages[0].content);
        }
        console.log("-------------------");
      }
      // The timeout for this is determined by the 'interval' parameter, which is multiplied by 1000 to convert seconds to milliseconds.
      await new Promise(resolve => setTimeout(resolve, interval * 1000));
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error:", error.message);
      }
      process.exit(1);
    }
  }
}

/**
 * Run the agent interactively based on user input
 *
 * @param agent - The agent executor
 * @param config - Agent configuration
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function runChatMode(agent: any, config: any) {
  console.log("Starting chat mode... Type 'exit' to end.");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> =>
    new Promise(resolve => rl.question(prompt, resolve));

  try {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const userInput = await question("\nPrompt: ");

      if (userInput.toLowerCase() === "exit") {
        break;
      }

      const stream = await agent.stream({ messages: [new HumanMessage(userInput)] }, config);

      for await (const chunk of stream) {
        if ("agent" in chunk) {
          console.log(chunk.agent.messages[0].content);
        } else if ("tools" in chunk) {
          console.log(chunk.tools.messages[0].content);
        }
        console.log("-------------------");
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    }
    process.exit(1);
  } finally {
    rl.close();
  }
}

export async function runChatStreamMode(agent: any, config: any, req: any, res: any) {
  try {
    if (!agent) {
      return res.status(500).json({ error: "Agent is not initialized yet." });
    }
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required in request body." });
    }

    const stream = await agent.stream({ messages: [new HumanMessage(message)] }, config);
    let responseText = "";

    for await (const chunk of stream) {
      if ("agent" in chunk) {
        responseText += chunk.agent.messages[0].content;
      } else if ("tools" in chunk) {
        responseText += chunk.tools.messages[0].content;
      }
    }

    res.json({ response: responseText.trim() });
  } catch (error) {
    console.error("Error processing chat:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Choose whether to run in autonomous or chat mode based on user input
 *
 * @returns Selected mode
 */
export async function chooseMode(): Promise<"chat" | "auto"> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> =>
    new Promise(resolve => rl.question(prompt, resolve));

  // eslint-disable-next-line no-constant-condition
  while (true) {
    console.log("\nAvailable modes:");
    console.log("1. chat    - Interactive chat mode");
    console.log("2. auto    - Autonomous action mode");

    const choice = (await question("\nChoose a mode (enter number or name): "))
      .toLowerCase()
      .trim();

    if (choice === "1" || choice === "chat") {
      rl.close();
      return "chat";
    } else if (choice === "2" || choice === "auto") {
      rl.close();
      return "auto";
    }
    console.log("Invalid choice. Please try again.");
  }
}

/**
 * Start the chatbot agent
 */
export async function main() {
  try {
    const { agent, config } = await initializeAgent();
    const mode = await chooseMode();

    if (mode === "chat") {
      await runChatMode(agent, config);
    } else {
      await runAutonomousMode(agent, config);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    }
    process.exit(1);
  }
}

// if (require.main === module) {
console.log("Starting Agent...");
main().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});
