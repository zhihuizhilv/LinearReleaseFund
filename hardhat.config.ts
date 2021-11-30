import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
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
    rinkeby: {
      url: 'https://eth-rinkeby.alchemyapi.io/v2/iLmZD1YJlEKWWEVgKMbrUllrFezOFbb7',
      gas: "auto",
      accounts: [process.env.HARDHAT_PRIKEY]
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
    },
    eth: {
      url: process.env.HARDHAT_RPC || "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
      gas: 15000000,
      gasPrice: 110000000000, // 110GWei
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
  etherscan: {
    // ======= Bsc =======
    // apiKey: 'APTN9SV7SX42MACATNQF6AGNNTN6H17IU4'
    // ======= Heco =======
    // apiKey: 'VDPJ2BPE4NEP1SBZZEDXIQJXJR1ZSDGWCU'
    // ======= Eth =======
    apiKey: 'SAEBBHC93CEZ82GK676USUS24CX58KMG58'
},
};
