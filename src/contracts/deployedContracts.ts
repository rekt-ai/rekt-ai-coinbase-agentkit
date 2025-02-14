export const deployedContracts = {
  31337: {
    RektPredictionMarket: {
      address: "0xc4cebf58836707611439e23996f4fa4165ea6a28",
      abi: [
        {
          type: "constructor",
          inputs: [
            {
              name: "_owner",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "FEE_PERCENTAGE",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "FEE_PRECISION",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "balances",
          inputs: [
            {
              name: "",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "createMarket",
          inputs: [
            {
              name: "_startTime",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_deadline",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_participationFee",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_name",
              type: "string",
              internalType: "string",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "getBalance",
          inputs: [
            {
              name: "user",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getMarketPhase",
          inputs: [
            {
              name: "marketId",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "uint8",
              internalType: "enum RektPredictionMarket.Phase",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getPlayerData",
          inputs: [
            {
              name: "marketId",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "player",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [
            {
              name: "predictionPrice",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "timestamp",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "data",
              type: "bytes32",
              internalType: "bytes32",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getPlayers",
          inputs: [
            {
              name: "marketId",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "playerAddresses",
              type: "address[]",
              internalType: "address[]",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "markets",
          inputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "startTime",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "deadline",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "entranceFee",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "finalPrice",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "totalAmount",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "settled",
              type: "bool",
              internalType: "bool",
            },
            {
              name: "name",
              type: "string",
              internalType: "string",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "nextOrderId",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "owner",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "participateInMarket",
          inputs: [
            {
              name: "marketId",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "predictionPrice",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_data",
              type: "bytes32",
              internalType: "bytes32",
            },
          ],
          outputs: [],
          stateMutability: "payable",
        },
        {
          type: "function",
          name: "renounceOwnership",
          inputs: [],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "settleMarket",
          inputs: [
            {
              name: "marketId",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_finalPrice",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "transferOwnership",
          inputs: [
            {
              name: "newOwner",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "withdrawBalances",
          inputs: [
            {
              name: "_amount",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "event",
          name: "MarketCreated",
          inputs: [
            {
              name: "marketId",
              type: "uint256",
              indexed: true,
              internalType: "uint256",
            },
            {
              name: "startTime",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
            {
              name: "deadline",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "MarketParticipation",
          inputs: [
            {
              name: "marketId",
              type: "uint256",
              indexed: true,
              internalType: "uint256",
            },
            {
              name: "player",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "predictionPrice",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "MarketSettled",
          inputs: [
            {
              name: "marketId",
              type: "uint256",
              indexed: true,
              internalType: "uint256",
            },
            {
              name: "winner",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "finalPrice",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
            {
              name: "predictionPrice",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
            {
              name: "totalAmount",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "OwnershipTransferred",
          inputs: [
            {
              name: "previousOwner",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "newOwner",
              type: "address",
              indexed: true,
              internalType: "address",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "WithdrawBalance",
          inputs: [
            {
              name: "user",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "amount",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "error",
          name: "OwnableInvalidOwner",
          inputs: [
            {
              name: "owner",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "OwnableUnauthorizedAccount",
          inputs: [
            {
              name: "account",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "ReentrancyGuardReentrantCall",
          inputs: [],
        },
      ],
      inheritedFunctions: {},
      deploymentFile: "run-1739527555.json",
      deploymentScript: "Deploy.s.sol",
    },
  },
  84532: {
    RektPredictionMarket: {
      address: "0x5641214dfb3a7a12731825193ad999b12303e706",
      abi: [
        {
          type: "constructor",
          inputs: [
            {
              name: "_owner",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "FEE_PERCENTAGE",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "FEE_PRECISION",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "balances",
          inputs: [
            {
              name: "",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "createMarket",
          inputs: [
            {
              name: "_startTime",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_deadline",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_participationFee",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_name",
              type: "string",
              internalType: "string",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "getBalance",
          inputs: [
            {
              name: "user",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getMarketPhase",
          inputs: [
            {
              name: "marketId",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "uint8",
              internalType: "enum RektPredictionMarket.Phase",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getPlayerData",
          inputs: [
            {
              name: "marketId",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "player",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [
            {
              name: "predictionPrice",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "timestamp",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "data",
              type: "bytes32",
              internalType: "bytes32",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getPlayers",
          inputs: [
            {
              name: "marketId",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "playerAddresses",
              type: "address[]",
              internalType: "address[]",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "markets",
          inputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "startTime",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "deadline",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "entranceFee",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "finalPrice",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "totalAmount",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "settled",
              type: "bool",
              internalType: "bool",
            },
            {
              name: "name",
              type: "string",
              internalType: "string",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "nextOrderId",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "owner",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "participateInMarket",
          inputs: [
            {
              name: "marketId",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "predictionPrice",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_data",
              type: "bytes32",
              internalType: "bytes32",
            },
          ],
          outputs: [],
          stateMutability: "payable",
        },
        {
          type: "function",
          name: "renounceOwnership",
          inputs: [],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "settleMarket",
          inputs: [
            {
              name: "marketId",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_finalPrice",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "transferOwnership",
          inputs: [
            {
              name: "newOwner",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "withdrawBalances",
          inputs: [
            {
              name: "_amount",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "event",
          name: "MarketCreated",
          inputs: [
            {
              name: "marketId",
              type: "uint256",
              indexed: true,
              internalType: "uint256",
            },
            {
              name: "startTime",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
            {
              name: "deadline",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "MarketParticipation",
          inputs: [
            {
              name: "marketId",
              type: "uint256",
              indexed: true,
              internalType: "uint256",
            },
            {
              name: "player",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "predictionPrice",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "MarketSettled",
          inputs: [
            {
              name: "marketId",
              type: "uint256",
              indexed: true,
              internalType: "uint256",
            },
            {
              name: "winner",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "finalPrice",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
            {
              name: "predictionPrice",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
            {
              name: "totalAmount",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "OwnershipTransferred",
          inputs: [
            {
              name: "previousOwner",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "newOwner",
              type: "address",
              indexed: true,
              internalType: "address",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "WithdrawBalance",
          inputs: [
            {
              name: "user",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "amount",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "error",
          name: "OwnableInvalidOwner",
          inputs: [
            {
              name: "owner",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "OwnableUnauthorizedAccount",
          inputs: [
            {
              name: "account",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "ReentrancyGuardReentrantCall",
          inputs: [],
        },
      ],
      inheritedFunctions: {},
      deploymentFile: "run-1739527613.json",
      deploymentScript: "Deploy.s.sol",
    },
  },
  421614: {
    RektPredictionMarket: {
      address: "0xe3b19b212375e31d3b7138ce86cc7706c7d36329",
      abi: [
        {
          type: "constructor",
          inputs: [
            {
              name: "_owner",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "FEE_PERCENTAGE",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "FEE_PRECISION",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "balances",
          inputs: [
            {
              name: "",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "createMarket",
          inputs: [
            {
              name: "_startTime",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_deadline",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_participationFee",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_name",
              type: "string",
              internalType: "string",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "getBalance",
          inputs: [
            {
              name: "user",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getMarketPhase",
          inputs: [
            {
              name: "marketId",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "uint8",
              internalType: "enum RektPredictionMarket.Phase",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getPlayerData",
          inputs: [
            {
              name: "marketId",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "player",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [
            {
              name: "predictionPrice",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "timestamp",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "data",
              type: "bytes32",
              internalType: "bytes32",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getPlayers",
          inputs: [
            {
              name: "marketId",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "playerAddresses",
              type: "address[]",
              internalType: "address[]",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "markets",
          inputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "startTime",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "deadline",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "entranceFee",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "finalPrice",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "totalAmount",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "settled",
              type: "bool",
              internalType: "bool",
            },
            {
              name: "name",
              type: "string",
              internalType: "string",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "nextOrderId",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "owner",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "participateInMarket",
          inputs: [
            {
              name: "marketId",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "predictionPrice",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_data",
              type: "bytes32",
              internalType: "bytes32",
            },
          ],
          outputs: [],
          stateMutability: "payable",
        },
        {
          type: "function",
          name: "renounceOwnership",
          inputs: [],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "settleMarket",
          inputs: [
            {
              name: "marketId",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_finalPrice",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "transferOwnership",
          inputs: [
            {
              name: "newOwner",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "withdrawBalances",
          inputs: [
            {
              name: "_amount",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "event",
          name: "MarketCreated",
          inputs: [
            {
              name: "marketId",
              type: "uint256",
              indexed: true,
              internalType: "uint256",
            },
            {
              name: "startTime",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
            {
              name: "deadline",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "MarketParticipation",
          inputs: [
            {
              name: "marketId",
              type: "uint256",
              indexed: true,
              internalType: "uint256",
            },
            {
              name: "player",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "predictionPrice",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "MarketSettled",
          inputs: [
            {
              name: "marketId",
              type: "uint256",
              indexed: true,
              internalType: "uint256",
            },
            {
              name: "winner",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "finalPrice",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
            {
              name: "predictionPrice",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
            {
              name: "totalAmount",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "OwnershipTransferred",
          inputs: [
            {
              name: "previousOwner",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "newOwner",
              type: "address",
              indexed: true,
              internalType: "address",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "WithdrawBalance",
          inputs: [
            {
              name: "user",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "amount",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "error",
          name: "OwnableInvalidOwner",
          inputs: [
            {
              name: "owner",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "OwnableUnauthorizedAccount",
          inputs: [
            {
              name: "account",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "ReentrancyGuardReentrantCall",
          inputs: [],
        },
      ],
      inheritedFunctions: {},
      deploymentFile: "run-1739527828.json",
      deploymentScript: "Deploy.s.sol",
    },
  },
} as const;
