const { expect } = require("chai");
import { ethers, network } from "hardhat";
import { BigNumber, BigNumberish, ContractFactory, Signer, utils } from "ethers";

import {Erc20Mock} from "../types/Erc20Mock";
import {Harvest} from "../types/Harvest";

let ERC20MockFactory: ContractFactory;
let HarvestFactory: ContractFactory;

describe("Harvest", function () {
    let deployer: Signer;
    let owner: Signer;
    let user: Signer;
    let user2: Signer;

    let erc20Mock: Erc20Mock;
    let harvest: Harvest;

    let MaxReward;
    let leftBlocks;
    let rewardRate;

    before(async () => {
        console.log("level 0, before");
        let signers = await ethers.getSigners();
        [deployer, owner, user, user2, ...signers] = signers;
        console.log("deployer:", await deployer.getAddress());
        console.log("owner:", await owner.getAddress());
        console.log("user:", await user.getAddress());
        console.log("user2:", await user2.getAddress());

        ERC20MockFactory = await ethers.getContractFactory("ERC20Mock");
        HarvestFactory = await ethers.getContractFactory("Harvest");

        console.log("\用户信息\n");
    });

    beforeEach(async () => {
        console.log("level 0, beforeEach");
    });

    context("when all right", () => {
        before(async () => {
            console.log("level 1, before");
        });

        beforeEach(async () => {
            console.log("level 1, beforeEach");
            erc20Mock = (await ERC20MockFactory.deploy("ERC20Mock", "ERC20Mock", 18)) as Erc20Mock;
            await erc20Mock.deployed();

            harvest = (await HarvestFactory.deploy(erc20Mock.address, 100000)) as Harvest;
            await harvest.deployed();

            console.log("erc20Mock:", erc20Mock.address);
            console.log("harvest:", harvest.address);

            MaxReward = await harvest.MaxReward();

            console.log("MaxReward:", MaxReward.toString());
            console.log("\n合约布署完成\n");
        });

        it("all right", async function () {
            // pending owner
            expect(await harvest.owner()).eq(await deployer.getAddress());
            await harvest.connect(deployer).setPendingOwner(await owner.getAddress());
            expect(await harvest.pendingOwner()).eq(await owner.getAddress());
            await harvest.connect(owner).acceptOwner();
            expect(await harvest.owner()).eq(await owner.getAddress());
            // console.log("\n合约拥有者和发布者地址一致，设置候选管理员，接受候选管理员\n");

            // 添加管理员，执行后的异常要和预期一致
            expect(harvest.connect(user).addFunder(await user.getAddress(), 100)).revertedWith("Ownable: only owner");
            expect(harvest.connect(owner).addFunder(await user.getAddress(), 0)).revertedWith("invalid fund rate");
            expect(harvest.connect(owner).addFunder(await user.getAddress(), 1000)).revertedWith("total rate over");
            
            // 合约投资人剩余百分比等于0
            expect(await harvest.totalRate()).eq(BigNumber.from(0));

            // 合约投资人剩余百分比等于10
            await harvest.connect(owner).addFunder(await user2.getAddress(), 10);
            expect(await harvest.totalRate()).eq(BigNumber.from(10));

            // 删除投资人
            await harvest.connect(owner).delFunder(await user2.getAddress());
            expect(await harvest.totalRate()).eq(BigNumber.from(0));

            console.log("\n================ 布署后投资人信息 ================\n");

            // 添加投资人并获取该投资人相关信息
            await harvest.connect(owner).addFunder(await user.getAddress(), 100);
            let selfDate = await harvest.selfData(await user.getAddress());
            console.log("最多领取收益数", selfDate[0].toString());
            console.log("当前总收益数", selfDate[1].toString());
            console.log("已领取收益总数", selfDate[2].toString());
            console.log("未领取的收益总数", selfDate[3].toString());

            // 最多领取收益数、当前总收益数、已领取收益总数、未领取的收益总数
            expect(selfDate[0]).eq(MaxReward);
            expect(selfDate[1]).eq( MaxReward / 100 * 20 * 1 );
            expect(selfDate[2]).eq(BigNumber.from("0"));
            expect(selfDate[3]).eq( MaxReward / 100 * 20 * 1 );
            // console.log("\n最多领取收益数、当前总收益数、已领取收益总数、未领取的收益总数与期待一致\n");

            // 合约投资人总比例等于100
            expect(await harvest.totalRate()).eq(BigNumber.from(100));
            // 添加投资人超出100，执行后的异常要和预期一致
            expect(harvest.connect(owner).addFunder(await user2.getAddress(), 10)).revertedWith("total rate over");

            // 增加300个区块
            for (let i = 0; i < 300; i++) {
                await network.provider.send("evm_mine");
            }
            // console.log("\n增加300个区块\n");
            console.log("\n================ 布署后投资人信息（第1季度） ================\n");

            // 获取用户信息（增加300个区块）
            selfDate = await harvest.selfData(await user.getAddress());
            console.log("最多领取收益数", selfDate[0].toString());
            console.log("当前总收益数", selfDate[1].toString());
            console.log("已领取收益总数", selfDate[2].toString());
            console.log("未领取的收益总数", selfDate[3].toString());
            expect(selfDate[0]).eq(MaxReward);
            expect(selfDate[1]).eq( MaxReward / 100 * 20 * 2 );
            expect(selfDate[2]).eq(BigNumber.from("0"));
            expect(selfDate[3]).eq( MaxReward / 100 * 20 * 2 );

            // console.log("\n最多领取收益数、当前总收益数、已领取收益总数、未领取的收益总数与期待一致（增加300个区块）\n");

            // 铸造代币
            await erc20Mock.connect(deployer).mint(harvest.address, MaxReward);

            console.log("\n================ 布署后投资人信息（领取奖励后） ================\n");

            // 领取奖励
            await harvest.connect(user).claim();

            selfDate = await harvest.selfData(await user.getAddress());
            console.log("最多领取收益数", selfDate[0].toString());
            console.log("当前总收益数", selfDate[1].toString());
            console.log("已领取收益总数", selfDate[2].toString());
            console.log("未领取的收益总数", selfDate[3].toString());

            // 继续增加300个区块
            for (let i = 0; i < 300; i++) {
                await network.provider.send("evm_mine");
            }
            // console.log("\n继续增加300个区块\n");
            console.log("\n================ 布署后投资人信息（第2季度） ================\n");

            selfDate = await harvest.selfData(await user.getAddress());
            console.log("最多领取收益数", selfDate[0].toString());
            console.log("当前总收益数", selfDate[1].toString());
            console.log("已领取收益总数", selfDate[2].toString());
            console.log("未领取的收益总数", selfDate[3].toString());





            // // console.log("rewardRate:", rewardRate);
            // // console.log("rewardRate.mul(100):", rewardRate.mul(100));

            // // let claimablePerBlock = rewardRate.mul(100);
            // // expect(selfDate[2]).eq(claimablePerBlock.mul(10));

            // // mint erc20Mock to harvest
            // // let mintAmount = claimablePerBlock.mul(12);
            // let mintAmount = MaxReward;
            // // 铸造代币
            // await erc20Mock.connect(deployer).mint(harvest.address, mintAmount);
            // // 代币合约余额等于铸造代币总数
            // expect(await erc20Mock.balanceOf(harvest.address)).eq(mintAmount);
            // // 投资人领取收益
            // await harvest.connect(user).claim();
            // console.log("harvest balance:", (await erc20Mock.balanceOf(harvest.address)).toString())
            // console.log("user balance:", (await erc20Mock.balanceOf(await user.getAddress())).toString())
            // // 释放合约余额等于0
            // expect(await erc20Mock.balanceOf(harvest.address)).eq(BigNumber.from("0"));
            // // 投资人余额等于铸造代币总数
            // expect(await erc20Mock.balanceOf(await user.getAddress())).eq(mintAmount);

            // expect(harvest.connect(owner).claim()).revertedWith("Ownable: only funder");
            // expect(harvest.connect(user).claim()).revertedWith("Your receivable income is zero");

            // // claim left all （领取剩余全部）
            // let totalBlockNumbers = leftBlocks;
            // // if (claimablePerBlock.mul(totalBlockNumbers).lt(MaxReward)) {
            // //     totalBlockNumbers = totalBlockNumbers.add(1);
            // // }
            // console.log("totalBlockNumbers:", totalBlockNumbers.toLocaleString());
            // let leftTotalToken = MaxReward.sub(mintAmount);
            // console.log("leftTotalToken:", leftTotalToken.toString());

            // await erc20Mock.connect(deployer).mint(harvest.address, leftTotalToken);
            // expect(await erc20Mock.balanceOf(harvest.address)).eq(leftTotalToken);
            // let skipBlockNum = totalBlockNumbers.sub(12).sub(1).sub(1).sub(1);
            // console.log("skipBlockNum:", skipBlockNum.toString());
            // let skipBlockNumInt = skipBlockNum.toNumber();
            // console.log("skipBlockNum:", skipBlockNumInt);
            // for (let i = 0; i < skipBlockNumInt; i++) {
            //     await network.provider.send("evm_mine");
            // }

            // // 获取投资人信息
            // selfDate = await harvest.selfData(await user.getAddress());
            // console.log("最多领取收益数:", selfDate[0].toString());
            // console.log("当前总收益数:", selfDate[1].toString());
            // console.log("已领取收益总数:", selfDate[2].toString());
            // console.log("未领取的收益数总数:", selfDate[3].toString());

            // // 领取奖励，合约余额等于0，投资人余额等于收益总数
            // await harvest.connect(user).claim();
            // console.log("harvest balance:", (await erc20Mock.balanceOf(harvest.address)).toString());
            // console.log("user balance:", (await erc20Mock.balanceOf(await user.getAddress())).toString());
            // // expect(await erc20Mock.balanceOf(harvest.address)).eq(leftTotalToken.sub(claimablePerBlock.mul(skipBlockNum.add(1).add(1))));
            // // expect(await erc20Mock.balanceOf(await user.getAddress())).eq(mintAmount.add(claimablePerBlock.mul(skipBlockNum.add(1).add(1))));
            
            // // 领取奖励，合约余额等于0，投资人余额等于收益总数
            // await harvest.connect(user).claim();
            // console.log("harvest balance:", (await erc20Mock.balanceOf(harvest.address)).toString());
            // console.log("user balance:", (await erc20Mock.balanceOf(await user.getAddress())).toString());
            // expect(await erc20Mock.balanceOf(harvest.address)).eq(BigNumber.from("0"));
            // expect(await erc20Mock.balanceOf(await user.getAddress())).eq(MaxReward);

        });
    })

});
