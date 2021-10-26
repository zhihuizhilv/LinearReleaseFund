const hre = require("hardhat");
const ethers = hre.ethers;
const BigNumber = ethers.BigNumber;
const deployResult = require('../deploy/deploy_result');


async function getHarvest() {
    return await ethers.getContractAt(deployResult.getData().deployedContract.harvest.contractName, deployResult.getData().deployedContract.harvest.address);
}

async function setPendingOwner(owner, pendingOwner) {
    let harvest = await getHarvest();
    console.log("harvest.pendingOwner:", await harvest.pendingOwner());
    await (await harvest.connect(owner).setPendingOwner(pendingOwner)).wait();
    console.log("harvest.pendingOwner:", await harvest.pendingOwner());
}


async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("network:", hre.network.name);
    console.log("deployer:", deployer.address)
    console.log("deployer balance:", ethers.utils.formatEther((await deployer.getBalance())));

    await deployResult.load();

    await setPendingOwner(deployer, "0xd1F971928b53C2032328e9F28Bb714da192Eb324");
}


main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });

