const hre = require("hardhat");
const ethers = hre.ethers;
const BigNumber = ethers.BigNumber;
const deployResult = require('../deploy/deploy_result');

const funders = [
  '0x361512395edE20E475928e2b24a8107Fc47ddAB5',
  '0x2461fb825A47FEd154776205842135972F4f4B88',
  '0x0FEf682990c99003acf47CB9CD872b43544547c9',
  '0x53F470A909d7CE7f35e62f4470fD440B1eD5D8CD',
  '0x5b59c3a485682e0B38c203a87cFe30356388cFF0',
  '0x0998eac7cfB3936ed1452b858715DadB83aac59b',
  '0x0bd2e7dd0853b0bfd8b33462ab7d66da80a984b5',
  '0xcE0D229d6dD09C2C92947294884CB9596bf42735',
  '0x9b1a57Da441D6d1e9A1DC48323709338b2b4b345',
  '0x40Fc79BDAf528263a20054d994CDb750D6568CE9',
  '0xfBa68B7D4F94Df4870b1e66dfC1299061eEdd98B',
  '0xEa30E6A5e9E670C71125f0b2aBe9c426B7f930c9',
  '0x1A5942ad23Bb1f81078AF395c2aF5227952fB105',
  '0x016550b47d76b10738c7aDbfD463671df077F108',
  '0xf74d2F28234E9fcfdF7Bf8290CddE53F65b9A49d',
  '0x7A2A190E119fca0DDc94158AC0D98973e938ec7c',
  '0x61d6f50785610D8341e443F69C67D4CC17a3f2F3',
  '0x5df32B16758cdF639E57fa89771151eD2b62a3Ea',
  '0x4BD74D345c128f0A80bc711740D16cf3cce70dE1',
  '0x9C0E9a8E72AB71aAd7C85B3e1f87e3A70C8f4d14',
  '0xBeC351a88FA58498b86e42500DC36436dB65A752',
  '0x9343873867756F9E8Ca203b80b70097e222FDbB3',
  '0x22EAC1355400145592631A355ab0Eb9d8da5AC3c',
  '0x77bDE1F09BE19F9DE5ef852648954968D650A32f',
  '0x568588CF1896186Da51593f4ee5925712112Ee30',
  '0x0d1424311917CeDbEc91C4c0e9eF70506335db86',
  '0xa50f89381301Decb11F1918586f98c5f2077e3Ca',
  '0x643Bdd50CF647Ac184483ecA6D7F4CEE45D781Bc',
  '0xE30221bA49E6d2eF1bCE23bB7262A1aE5f3ffB99',
  '0x6D40315C519D7567B7dc6B108636E847FbF232cc',
  '0x80C29E7E974bb2b34C739FEA45d4E3D9FfcB81d5',
  '0xb594a4E1e0a7d572dC29a49e90de1Cfe98262C31',
  '0xAfb8B58D561c6DDb6CEf703278ecFa2fF5216646',
  '0x6cf2a56F930dA84931F4935fc7E9B6691567ec40',
  '0x12FcBfdFD326275BB5BbB5Ba8c1d70235B574336',
  '0x4cEcDcbdFE956BCf55FB881Cd826eDa5d98b5114',
  '0x51d77f4CFc0448Eeb231cAF5a279F9bb5ea3Bfe9',
  '0x82Ba7508f7F1995AB1623258D66Cb4E2B2b8F467',
  '0x81DC6F15eE72F6E6d49CB6Ca44C0Bf8E63770027',
  '0xaDDca5F5C7D2DE98bAaD07A3E4a9D3bD9e468e23',
  '0x652a63232770813ac2B7Fe704bcbcB13688026Ce',
  '0x45C90Da6dC0B7D6282824E684492F48Cd50CA5DA',
  '0xd8ea0E6eda44A1f393746fFa4D3E1e8Af30029D2',
  '0x608772776AeaAc47db52f2Ff91D01F4ee222BfD3',
  '0x92f8CBAa319C12511cA67a4E457AD70585BECd2A',
    '0x262CF2de08C618537Bc49b396b3a36a1F3F271d6',
];

async function getHarvest() {
  return await ethers.getContractAt(deployResult.getData().deployedContract.harvest.contractName, deployResult.getData().deployedContract.harvest.address);
}

async function getToken() {
  return await ethers.getContractAt(deployResult.getData().deployedContract.erc20Mock.contractName, deployResult.getData().deployedContract.erc20Mock.address);
}

async function getClaimAble() {
  let harvest = await getHarvest();
  for (let i = 0; i < funders.length; i++) {
    let funder = funders[i];
    let dataInfo = await harvest.selfData(funder);
    console.log(funder,
        ethers.utils.formatEther(dataInfo[0]),
        ethers.utils.formatEther(dataInfo[1]),
        ethers.utils.formatEther(dataInfo[2]),
        ethers.utils.formatEther(dataInfo[3]));
  }
}

async function claim(funder) {
  let erc20Mock = await getToken();
  let harvest = await getHarvest();
  console.log("balance:", ethers.utils.formatEther(await erc20Mock.balanceOf(funder)));
  await harvest.claim();
  console.log("balance:", ethers.utils.formatEther(await erc20Mock.balanceOf(funder)));
}

async function mintToken() {
  let erc20Mock = await getToken();
  let harvest = await getHarvest();
  await erc20Mock.mint(harvest.address, ethers.utils.parseEther("10000000"));
  console.log("balance:", ethers.utils.formatEther(await erc20Mock.balanceOf(harvest.address)));
}


async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("network:", hre.network.name);
  console.log("deployer:", deployer.address)
  console.log("deployer balance:", ethers.utils.formatEther((await deployer.getBalance())));

  await deployResult.load();

  // await mintToken();
  // await getClaimAble();
  await claim(deployer.address);

  console.log("done");
}


main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });

