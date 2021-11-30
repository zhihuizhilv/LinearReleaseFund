const hre = require("hardhat");
const ethers = hre.ethers;

module.exports = {
    local: {
        totalReward: ethers.utils.parseEther("35205512"),   // 总分发额度
        totalDays: 311,                                     // 领取总天数
        DMT: "0x57A7BcdfAb1631ACA9d6E0f39959477182CfAe12",
    },

    heco: {
        totalReward: ethers.utils.parseEther("35205512"),   // 总分发额度
        totalDays: 311,                                     // 领取总天数
        DMT: "0x57A7BcdfAb1631ACA9d6E0f39959477182CfAe12",
    },

    bsc: {
        totalReward: ethers.utils.parseEther("49041098"),   // 总分发额度
        totalDays: 311,                                     // 领取总天数
        DMT: "0x3Eb05a201817F87C198930B86F40C6829340b4B7",
    },

    rinkeby: {
        totalReward: ethers.utils.parseEther("1000000"),   // 总分发额度
        DMT: "0x17Ac041b33f14E76a6314e0d3cD8857D04C3c00e",
    },
}
