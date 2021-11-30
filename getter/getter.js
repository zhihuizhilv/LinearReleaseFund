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
    console.log("harvest.MaxReward:", ethers.utils.formatEther(await harvest.MaxReward()));
    console.log("harvest.rewardRate:", ethers.utils.formatEther(await harvest.rewardRate()));
    for (let i = 0; i < funders.length; i++) {
        let state = await harvest.selfData(funders[i]);
        console.log(funders[i], 'self_max_reward:', ethers.utils.formatEther(state[0]), 'self_max_unclaimed:', ethers.utils.formatEther(state[1]), 'self_active_reward:', ethers.utils.formatEther(state[2]));
        // console.log(funders[i], 'totalClaimed:', ethers.utils.formatEther((await harvest.funders(funders[i])).totalClaimed));
    }
}

async function calcPool2RewardAmount() {
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

    let rewardPerDay = [
        ethers.utils.parseEther("68491"),
        ethers.utils.parseEther("41095"),
        ethers.utils.parseEther("41095"),
        ethers.utils.parseEther("27398"),
        ethers.utils.parseEther("13699"),
        ethers.utils.parseEther("13699"),
        ethers.utils.parseEther("13699"),
        ethers.utils.parseEther("13699"),
        ethers.utils.parseEther("13699"),
        ethers.utils.parseEther("13699"),
        ethers.utils.parseEther("13699")
    ]

    let reward16Day = [
        rewardPerDay[0].mul(16),
        rewardPerDay[1].mul(16),
        rewardPerDay[2].mul(16),
        rewardPerDay[3].mul(16),
        rewardPerDay[4].mul(16),
        rewardPerDay[5].mul(16),
        rewardPerDay[6].mul(16),
        rewardPerDay[7].mul(16),
        rewardPerDay[8].mul(16),
        rewardPerDay[9].mul(16),
        rewardPerDay[10].mul(16)
    ]

    let claimed = [
        ethers.utils.parseEther("775926.50002083332859643"),
        ethers.utils.parseEther("615383.92012499999568738"),
        ethers.utils.parseEther("0.0"),
        ethers.utils.parseEther("0.0"),
        ethers.utils.parseEther("0.0"),
        ethers.utils.parseEther("0.0"),
        ethers.utils.parseEther("163581.26112499999885362"),
        ethers.utils.parseEther("163604.09212499999885346"),
        ethers.utils.parseEther("163618.83714583333218669"),
        ethers.utils.parseEther("163620.73972916666552001"),
        ethers.utils.parseEther("163624.54489583333218665")
    ]

    let hecoTotal = ethers.utils.parseEther("50000000");
    let totalLeft = ethers.utils.parseEther("7890640.10483333334811576");

    let totalPerDay = ethers.utils.parseEther("0");
    for (let i = 0; i < funders.length; i++) {
        totalPerDay = totalPerDay.add(rewardPerDay[i]);
    }

    let totalManualRelease = ethers.utils.parseEther("0");
    for (let i = 0; i < funders.length; i++) {
        let manualRelease = reward16Day[i].sub(claimed[i]);
        totalManualRelease = totalManualRelease.add(manualRelease);
    }

    let manual38Total = totalPerDay.mul(38);
    let auto16Total = totalPerDay.mul(16);
    let autoPool2Total = hecoTotal.sub(auto16Total).sub(manual38Total);
    let autoPool2First = totalLeft.sub(totalManualRelease);
    let luAutoPool2Total = autoPool2Total.sub(autoPool2First);

    console.log("HECO总额:", ethers.utils.formatEther(hecoTotal));
    console.log("历史每天总额:", ethers.utils.formatEther(totalPerDay));
    console.log("38天手动发放总额:", ethers.utils.formatEther(manual38Total));
    console.log("16天自动发放总额:", ethers.utils.formatEther(auto16Total));
    console.log("自动发放合约2总额:", ethers.utils.formatEther(autoPool2Total));
    console.log("提取剩余资金总额:", ethers.utils.formatEther(totalLeft));
    console.log("手动补发总额:", ethers.utils.formatEther(totalManualRelease));
    console.log("转新池总额:", ethers.utils.formatEther(autoPool2First));
    console.log("陆总后续转新池总额:", ethers.utils.formatEther(luAutoPool2Total));

    for (let i = 0; i < funders.length; i++) {
        let manualRelease = reward16Day[i].sub(claimed[i]);
        console.log(funders[i], "16天应领取:", ethers.utils.formatEther(reward16Day[i]), "16天已领取:", ethers.utils.formatEther(claimed[i]), "手动补发:", ethers.utils.formatEther(manualRelease));
    }
}

async function main() {
    await getHarvestInfo();
    // await calcPool2RewardAmount();
}


main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });

