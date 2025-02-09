import express from "express";
import {
  initializeAgent,
  runAutonomousMode,
  runChatMode,
  runChatStreamMode,
  validateEnvironment,
} from "./agent";
import * as dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const port = process.env.PORT || 8081;
app.use(
  cors({
    origin: "*",
  }),
);
app.use(express.json()); // Middleware to parse JSON body

// Add this right after imports and before any other code

app.get("/run/:mode", async (req, res) => {
  validateEnvironment();
  try {
    const { agent, config } = await initializeAgent();
    let mode = req.params.mode;

    while (true) {
      if (mode === "chat") {
        await runChatMode(agent, config);
        // Restart if 'exit' is received in chat mode
        // mode = req.params.mode;
        //   } else if (mode === "chatStream") {
        //     await runChatStreamMode(agent, config, req, res);
        // Autonomous mode keeps running indefinitely
      } else if (mode === "auto") {
        await runAutonomousMode(agent, config);
        // Autonomous mode keeps running indefinitely
      }
    }
    res.send("Agent executed successfully.");
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error);
      res.status(500).send("Internal Server Error: " + error);
    } else {
      res.status(500).send("Unknown error occurred.");
    }
  }
});

app.post("/chat", async (req, res) => {
  try {
    validateEnvironment();
    const { agent, config } = await initializeAgent();
    await runChatStreamMode(agent, config, req, res);
  } catch (error) {
    console.error("Error processing chat:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// API endpoint to trigger nodemon restart
app.get("/restart", (req, res) => {
  // This will cause nodemon to restart the app
  console.log("Restarting the app...");
  process.exit(0); // Exit the process, causing nodemon to restart
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
