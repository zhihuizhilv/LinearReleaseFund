// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
// import {ethers} from "hardhat";
// import {ZERO_ADDRESS} from "../test/utils/helpers";

const hre = require("hardhat");
const ethers = hre.ethers;
const deployResult = require('./deploy_result');
const deployConfig = require('./deploy_config')[hre.network.name];

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("network:", hre.network.name);
    console.log("deployer:", deployer.address)
    console.log("deployer balance:", ethers.utils.formatEther((await deployer.getBalance())));

    await deployResult.load();

    // let HarvestFactory = await ethers.getContractFactory("Harvest");
    // let harvest = await HarvestFactory.deploy(deployConfig.DMT, deployConfig.totalReward, deployConfig.totalDays);
    // await harvest.deployed();
    // deployResult.writeAbi("Harvest", HarvestFactory);
    // deployResult.writeDeployedContract(
    //   "harvest",
    //   harvest.address,
    //   "Harvest",
    //   {
    //       _dmtToken: deployConfig.DMT,
    //       _totalReward: deployConfig.totalReward,
    //       _totalDays: deployConfig.totalDays,
    //   }
    // );

    // Pacific
    let HarvestFactory = await ethers.getContractFactory("Harvest2");
    let harvest = await HarvestFactory.deploy(deployConfig.DMT, deployConfig.totalReward);
    await harvest.deployed();
    deployResult.writeAbi("Harvest", HarvestFactory);
    deployResult.writeDeployedContract(
      "harvest",
      harvest.address,
      "Harvest2",
      {
          _dmtToken: deployConfig.DMT,
          _totalReward: deployConfig.totalReward
      }
    );

    await deployResult.save();
    console.log("deploy done.");

    console.log("begin add funder.");
    await (await harvest.addFunder("0x4CA16349B951FAe33B219de0B2d3af317b2ED2da", 25)).wait();
    await (await harvest.addFunder("0xb1147BeAFE9840cf80193AEca976f98B3C833998", 15)).wait();
    await (await harvest.addFunder("0xce72Ee5A81d411f1B2B255ba4874307e66F95799", 15)).wait();
    await (await harvest.addFunder("0x5A6184905dc1Af2eaf6e694Ba69a4032297aC593", 10)).wait();
    await (await harvest.addFunder("0xb2270d679371E310b37bd562427444c7cf3B9B39", 5)).wait();
    await (await harvest.addFunder("0x21C0C7Def1c839b9eE792dc8699F5593A5b2002D", 5)).wait();
    await (await harvest.addFunder("0x3306BC745c90B4939924ec242B785b26089E08fd", 5)).wait();
    await (await harvest.addFunder("0x856c27170f0AaCeB1Ec6880BF07312924C8E9DB9", 5)).wait();
    await (await harvest.addFunder("0xF08b3d466A6474c29265AEBaF230D7056C4Ba350", 5)).wait();
    await (await harvest.addFunder("0x13cc57064C578A51bc399F388DAc371a81F91726", 5)).wait();
    await (await harvest.addFunder("0xeABdbE1d8CA2fd188e771275A501a5eC2EA83FEc", 5)).wait();
    console.log("add funder end.");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
























