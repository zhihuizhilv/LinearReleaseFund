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

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("network:", hre.network.name);
    console.log("deployer:", deployer.address)
    console.log("deployer balance:", ethers.utils.formatEther((await deployer.getBalance())));

    await deployResult.load();

    let HarvestFactory = await ethers.getContractFactory("Harvest");
    let DMT = "0x57A7BcdfAb1631ACA9d6E0f39959477182CfAe12";
    let harvest = await HarvestFactory.deploy(DMT);
    await harvest.deployed();
    deployResult.writeAbi("Harvest", HarvestFactory);
    deployResult.writeDeployedContract(
      "harvest",
      harvest.address,
      "Harvest",
      {
        _dmtToken: DMT,
      }
    );

    await deployResult.save();
    console.log("deploy done.");

    console.log("begin add funder.");
    await (await harvest.addFunder("****************************", 10)).wait();
    await (await harvest.addFunder("****************************", 10)).wait();
    await (await harvest.addFunder("****************************", 10)).wait();
    await (await harvest.addFunder("****************************", 10)).wait();
    await (await harvest.addFunder("****************************", 10)).wait();
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
























