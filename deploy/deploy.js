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
    // 投资人列表
    const funders = {
      '0x361512395edE20E475928e2b24a8107Fc47ddAB5': 7142857,
      '0x2461fb825A47FEd154776205842135972F4f4B88': 5619048,
      '0x0FEf682990c99003acf47CB9CD872b43544547c9': 9047619,
      '0x53F470A909d7CE7f35e62f4470fD440B1eD5D8CD': 7142857,
      '0x5b59c3a485682e0B38c203a87cFe30356388cFF0': 10476190,
      '0x0998eac7cfB3936ed1452b858715DadB83aac59b': 5238095,
      '0x0bd2e7dd0853b0bfd8b33462ab7d66da80a984b5': 7619048,
      '0xcE0D229d6dD09C2C92947294884CB9596bf42735': 5619048,
      '0x9b1a57Da441D6d1e9A1DC48323709338b2b4b345': 2095238,
      '0x40Fc79BDAf528263a20054d994CDb750D6568CE9': 5714286,
      '0xfBa68B7D4F94Df4870b1e66dfC1299061eEdd98B': 9714286,
      '0xEa30E6A5e9E670C71125f0b2aBe9c426B7f930c9': 5714286,
      '0x1A5942ad23Bb1f81078AF395c2aF5227952fB105': 1428571,
      '0x016550b47d76b10738c7aDbfD463671df077F108': 3571429,
      '0xf74d2F28234E9fcfdF7Bf8290CddE53F65b9A49d': 1428571,
      '0x7A2A190E119fca0DDc94158AC0D98973e938ec7c': 1428571,
      '0x61d6f50785610D8341e443F69C67D4CC17a3f2F3': 714286,
      '0x5df32B16758cdF639E57fa89771151eD2b62a3Ea' : 714286,
      '0x4BD74D345c128f0A80bc711740D16cf3cce70dE1': 5714286,
      '0x9C0E9a8E72AB71aAd7C85B3e1f87e3A70C8f4d14': 2857143,
      '0xBeC351a88FA58498b86e42500DC36436dB65A752': 2000000,
      '0x9343873867756F9E8Ca203b80b70097e222FDbB3': 14666667,
      '0x22EAC1355400145592631A355ab0Eb9d8da5AC3c': 5066667,
      '0x77bDE1F09BE19F9DE5ef852648954968D650A32f': 3333333,
      '0x568588CF1896186Da51593f4ee5925712112Ee30' : 3333333,
      '0x0d1424311917CeDbEc91C4c0e9eF70506335db86': 4666667,
      '0xa50f89381301Decb11F1918586f98c5f2077e3Ca': 11466667,
      '0x643Bdd50CF647Ac184483ecA6D7F4CEE45D781Bc': 2666667,
      '0xE30221bA49E6d2eF1bCE23bB7262A1aE5f3ffB99': 11333333,
      '0x6D40315C519D7567B7dc6B108636E847FbF232cc': 1333333,
      '0x80C29E7E974bb2b34C739FEA45d4E3D9FfcB81d5': 6666667,
      '0xb594a4E1e0a7d572dC29a49e90de1Cfe98262C31': 666667,
      '0xAfb8B58D561c6DDb6CEf703278ecFa2fF5216646': 4000000,
      '0x6cf2a56F930dA84931F4935fc7E9B6691567ec40': 8000000,
      '0x12FcBfdFD326275BB5BbB5Ba8c1d70235B574336': 2000000,
      '0x4cEcDcbdFE956BCf55FB881Cd826eDa5d98b5114': 4000000,
      '0x51d77f4CFc0448Eeb231cAF5a279F9bb5ea3Bfe9': 4000000,
      '0x82Ba7508f7F1995AB1623258D66Cb4E2B2b8F467': 400000,
      '0x81DC6F15eE72F6E6d49CB6Ca44C0Bf8E63770027': 200000,
      '0xaDDca5F5C7D2DE98bAaD07A3E4a9D3bD9e468e23': 6666667,
      '0x652a63232770813ac2B7Fe704bcbcB13688026Ce': 4285714,
      '0x45C90Da6dC0B7D6282824E684492F48Cd50CA5DA': 2000000,
      '0xd8ea0E6eda44A1f393746fFa4D3E1e8Af30029D2': 4857143,
      '0x608772776AeaAc47db52f2Ff91D01F4ee222BfD3': 7142857,
      '0x92f8CBAa319C12511cA67a4E457AD70585BECd2A': 500,
      '0x145FF683e85F289FAB329835926a16a8f57762C8': 1000
    };

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
    let HarvestFactory = await ethers.getContractFactory("Harvest");
    let harvest = await HarvestFactory.deploy(deployConfig.DMT, deployConfig.totalReward);
    await harvest.deployed();
    deployResult.writeAbi("Harvest", HarvestFactory);
    deployResult.writeDeployedContract(
      "harvest",
      harvest.address,
      "Harvest",
      {
          _dmtToken: deployConfig.DMT,
          _totalReward: deployConfig.totalReward
      }
    );

    await deployResult.save();
    console.log("deploy done.");

    console.log("begin add funder.");
    for (const addr in funders) {
      const totalToken = funders[addr];
      console.log(addr,totalToken);
      await (await harvest.addFunder(addr, totalToken)).wait();
    }
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
























