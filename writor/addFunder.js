const hre = require("hardhat");
const ethers = hre.ethers;
const BigNumber = ethers.BigNumber;
const deployResult = require('../deploy/deploy_result');


async function getHarvest() {
    return await ethers.getContractAt(deployResult.getData().deployedContract.harvest.contractName, deployResult.getData().deployedContract.harvest.address);
}

async function addFunder() {
    let harvest = await getHarvest();
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


async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("network:", hre.network.name);
    console.log("deployer:", deployer.address)
    console.log("deployer balance:", ethers.utils.formatEther((await deployer.getBalance())));

    await deployResult.load();

    await addFunder();
    console.log("done");
}


main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });

