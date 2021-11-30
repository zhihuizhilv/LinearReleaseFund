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

let ERC20MockFactory;
let erc20Mock;

async function deploy() {
    console.log("deploy begin.");
    let name = "mock token";
    let symbol = "MT";
    let decimals = 18;
    ERC20MockFactory = await ethers.getContractFactory("ERC20Mock");
    erc20Mock = await ERC20MockFactory.deploy(name, symbol, decimals);
    await erc20Mock.deployed();

    deployResult.writeAbi("ERC20Mock", ERC20MockFactory);
    deployResult.writeDeployedContract(
        "erc20Mock",
        erc20Mock.address,
        "ERC20Mock",
        {
            _name: name,
            _symbol: symbol,
            _decimals: decimals
        }
    );

    await deployResult.save();
    console.log("deploy done.");
}

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("network:", hre.network.name);
    console.log("deployer:", deployer.address)
    console.log("deployer balance:", ethers.utils.formatEther((await deployer.getBalance())));

    await deployResult.load();

    await deploy();

    console.log("end");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
























