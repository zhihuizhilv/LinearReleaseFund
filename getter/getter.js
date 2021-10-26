const hre = require("hardhat");
const ethers = hre.ethers;
const BigNumber = ethers.BigNumber;
const DeployResultFile = '../deploy_results/deploy.' + hre.network.name + '.json';
const deployResult = require(DeployResultFile);


async function getHarvest() {
    return await ethers.getContractAt(deployResult.deployedContract.harvest.contractName, deployResult.deployedContract.harvest.address);
}

async function getHarvestInfo() {
    let funders = [
        "0x4CA16349B951FAe33B219de0B2d3af317b2ED2da",
        "0xb1147BeAFE9840cf80193AEca976f98B3C833998",
        "0xce72Ee5A81d411f1B2B255ba4874307e66F95799",
        "0x5A6184905dc1Af2eaf6e694Ba69a4032297aC593",
        "0xb2270d679371E310b37bd562427444c7cf3B9B39",
        "0x21C0C7Def1c839b9eE792dc8699F5593A5b2002D",
        "0x3306BC745c90B4939924ec242B785b26089E08fd",
        "0x856c27170f0AaCeB1Ec6880BF07312924C8E9DB9",
        "0xF08b3d466A6474c29265AEBaF230D7056C4Ba350",
        "0x13cc57064C578A51bc399F388DAc371a81F91726",
        "0xeABdbE1d8CA2fd188e771275A501a5eC2EA83FEc"
    ];

    let harvest = await getHarvest();
    console.log("harvest.owner:", await harvest.owner());
    console.log("harvest.pendingOwner:", await harvest.pendingOwner());
    console.log("harvest.totalRate:", (await harvest.totalRate()).toString());
    for (let i = 0; i < funders.length; i++) {
        let state = await harvest.selfData(funders[i]);
        console.log(funders[i], 'self_max_reward:', ethers.utils.formatEther(state[0]), 'self_max_unclaimed:', ethers.utils.formatEther(state[1]), 'self_active_reward:', ethers.utils.formatEther(state[2]));
    }
}


async function main() {
    await getHarvestInfo();
}


main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });

