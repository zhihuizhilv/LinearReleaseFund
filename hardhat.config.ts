import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "hardhat-typechain";
import "solidity-coverage";

require('dotenv').config()

export default {
  networks: {
    local: {
      url: "http://localhost:8545",
      gas: "auto",
    },
    hardhat: {
      chainId: 5777,
      allowUnlimitedContractSize: false,
      blockGasLimit: 25000000,
      gas: "auto",
    },
    heco: {
      url: process.env.HARDHAT_RPC || "https://http-mainnet.hecochain.com",
      gas: 8000000,
      accounts: [process.env.HARDHAT_PRIKEY]
    },
    bsc: {
      url: process.env.HARDHAT_RPC || "https://bsc-dataseed.binance.org/",
      gas: 8000000,
      accounts: [process.env.HARDHAT_PRIKEY]
    }
  },
  solidity: {
    version: "0.6.12",
    settings: {
      optimizer: {
        enabled: true,
        runs: 999999,
      },
    },
  },
  typechain: {
    outDir: "types",
    target: "ethers-v5"
  },
};