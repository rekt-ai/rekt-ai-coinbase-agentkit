import { customActionProvider, EvmWalletProvider } from "@coinbase/agentkit";
import { z } from "zod";

export const customSignMessage = customActionProvider<EvmWalletProvider>({
  // wallet types specify which providers can use this action. It can be as generic as WalletProvider or as specific as CdpWalletProvider
  name: "signMessage",
  description: "Sign arbitrary messages using EIP-191 Signed Message Standard hashing",
  schema: z.object({
    message: z.string().describe("The message to sign"),
  }),
  invoke: async (walletProvider, args: any) => {
    const { message } = args;
    const signature = await walletProvider.signMessage(message);
    return `The payload signature ${signature}`;
  },
});
