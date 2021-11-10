const hre = require("hardhat");
const ethers = hre.ethers;
const BigNumber = ethers.BigNumber;
const deployResult = require('../deploy/deploy_result');


async function getHarvest() {
    return await ethers.getContractAt(deployResult.getData().deployedContract.harvest.contractName, deployResult.getData().deployedContract.harvest.address);
}

async function withdraw(owner, dmt, amount) {
    let harvest = await getHarvest();
    await (await harvest.withdraw(dmt, owner.address, amount)).wait();
}


async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("network:", hre.network.name);
    console.log("deployer:", deployer.address)
    console.log("deployer balance:", ethers.utils.formatEther((await deployer.getBalance())));

    await deployResult.load();

    let dmt = "0x57A7BcdfAb1631ACA9d6E0f39959477182CfAe12";
    let amount = ethers.utils.formatEther("7890640.10483333334811576");
    await withdraw(deployer, dmt, amount);
}


main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });

