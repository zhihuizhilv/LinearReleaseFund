const hre = require("hardhat");
const ethers = hre.ethers;
const BigNumber = ethers.BigNumber;
const deployResult = require('../deploy/deploy_result');
const deployConfig = require('../deploy/deploy_config')[hre.network.name];


async function getDmt() {
    return await ethers.getContractAt("ERC20Mock", deployConfig.DMT);
}


async function release() {
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

    // let releaseAmount = [
    //     ethers.utils.parseEther('1')
    // ]

    let releaseAmount = [
        ethers.utils.parseEther('319928.49997916667140357'),
        ethers.utils.parseEther('42136.07987500000431262'),
        ethers.utils.parseEther('657520.0'),
        ethers.utils.parseEther('438368.0'),
        ethers.utils.parseEther('219184.0'),
        ethers.utils.parseEther('219184.0'),
        ethers.utils.parseEther('55602.73887500000114638'),
        ethers.utils.parseEther('55579.90787500000114654'),
        ethers.utils.parseEther('55565.16285416666781331'),
        ethers.utils.parseEther('55563.26027083333447999'),
        ethers.utils.parseEther('55559.45510416666781335')
    ]


    let dmt = await getDmt();
    for (let i = 0; i < funders.length; i++) {
    // for (let i = 0; i < 1; i++) {
        console.log("begin release to", funders[i]);
        await (await dmt.transfer(funders[i], releaseAmount[i])).wait();
        console.log("release to", funders[i], "done");
    }
}


async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("network:", hre.network.name);
    console.log("deployer:", deployer.address)
    console.log("deployer balance:", ethers.utils.formatEther((await deployer.getBalance())));

    await deployResult.load();

    console.log('begin manual release');
    // await release();
    console.log('done');
}


main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });

