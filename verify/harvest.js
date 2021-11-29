const hre = require("hardhat");
const ethers = hre.ethers;

const deployConfig = require("../deploy/deploy_config")[hre.network.name];

// async const [deployer] = await ethers.getSigners();

module.exports = [
  deployConfig.DMT,
  deployConfig.totalReward
];
