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
        console.log("user2:", await user.getAddress());

        ERC20MockFactory = await ethers.getContractFactory("ERC20Mock");
        HarvestFactory = await ethers.getContractFactory("Harvest");
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

            harvest = (await HarvestFactory.deploy(erc20Mock.address)) as Harvest;
            await harvest.deployed();

            console.log("erc20Mock:", erc20Mock.address);
            console.log("harvest:", harvest.address);

            MaxReward = await harvest.MaxReward();
            leftBlocks = await harvest.leftBlocks();
            rewardRate = await harvest.rewardRate();

            console.log("MaxReward:", MaxReward.toString());
            console.log("leftBlocks:", leftBlocks.toString());
            console.log("rewardRate:", rewardRate.toString());
        });

        it("all right", async function () {
            // pending owner
            expect(await harvest.owner()).eq(await deployer.getAddress());
            await harvest.connect(deployer).setPendingOwner(await owner.getAddress());
            expect(await harvest.pendingOwner()).eq(await owner.getAddress());
            await harvest.connect(owner).acceptOwner();
            expect(await harvest.owner()).eq(await owner.getAddress());

            // addFunder
            expect(harvest.connect(user).addFunder(await user.getAddress(), 100)).revertedWith("Ownable: only owner");
            expect(harvest.connect(owner).addFunder(await user.getAddress(), 0)).revertedWith("invalid fund rate");
            expect(harvest.connect(owner).addFunder(await user.getAddress(), 1000)).revertedWith("total rate over");
            expect(await harvest.totalRate()).eq(BigNumber.from(0));
            await harvest.connect(owner).addFunder(await user2.getAddress(), 10);
            expect(await harvest.totalRate()).eq(BigNumber.from(10));
            await harvest.connect(owner).delFunder(await user2.getAddress());
            expect(await harvest.totalRate()).eq(BigNumber.from(0));

            await harvest.connect(owner).addFunder(await user.getAddress(), 100);
            let selfDate = await harvest.selfData(await user.getAddress());
            console.log(selfDate[0].toString());
            console.log(selfDate[1].toString());
            console.log(selfDate[2].toString());
            expect(selfDate[0]).eq(MaxReward);
            expect(selfDate[1]).eq(MaxReward);
            expect(selfDate[2]).eq(BigNumber.from("0"));
            expect(await harvest.totalRate()).eq(BigNumber.from(100));
            expect(harvest.connect(owner).addFunder(await user2.getAddress(), 10)).revertedWith("total rate over");

            for (let i = 0; i < 10; i++) {
                await network.provider.send("evm_mine");
            }

            selfDate = await harvest.selfData(await user.getAddress());
            console.log("totalMaxReward:", selfDate[0].toString());
            console.log("totalUnclaimed:", selfDate[1].toString());
            console.log("claimable:", selfDate[2].toString());
            expect(selfDate[0]).eq(MaxReward);
            expect(selfDate[1]).eq(MaxReward);

            let claimablePerBlock = rewardRate.mul(100);
            expect(selfDate[2]).eq(claimablePerBlock.mul(10));

            // mint erc20Mock to harvest
            let mintAmount = claimablePerBlock.mul(12);
            await erc20Mock.connect(deployer).mint(harvest.address, mintAmount);
            expect(await erc20Mock.balanceOf(harvest.address)).eq(mintAmount);
            await harvest.connect(user).claim();
            console.log("harvest balance:", (await erc20Mock.balanceOf(harvest.address)).toString())
            console.log("user balance:", (await erc20Mock.balanceOf(await user.getAddress())).toString())
            expect(await erc20Mock.balanceOf(harvest.address)).eq(BigNumber.from("0"));
            expect(await erc20Mock.balanceOf(await user.getAddress())).eq(mintAmount);

            expect(harvest.connect(owner).claim()).revertedWith("Ownable: only funder");
            expect(harvest.connect(user).claim()).revertedWith("Your receivable income is zero");

            // claim left all
            let totalBlockNumbers = leftBlocks;
            if (claimablePerBlock.mul(totalBlockNumbers).lt(MaxReward)) {
                totalBlockNumbers = totalBlockNumbers.add(1);
            }
            console.log("totalBlockNumbers:", totalBlockNumbers.toLocaleString());
            let leftTotalToken = MaxReward.sub(mintAmount);
            console.log("leftTotalToken:", leftTotalToken.toString());

            await erc20Mock.connect(deployer).mint(harvest.address, leftTotalToken);
            expect(await erc20Mock.balanceOf(harvest.address)).eq(leftTotalToken);
            let skipBlockNum = totalBlockNumbers.sub(12).sub(1).sub(1).sub(1);
            console.log("skipBlockNum:", skipBlockNum.toString());
            let skipBlockNumInt = skipBlockNum.toNumber();
            console.log("skipBlockNum:", skipBlockNumInt);
            for (let i = 0; i < skipBlockNumInt; i++) {
                await network.provider.send("evm_mine");
            }

            selfDate = await harvest.selfData(await user.getAddress());
            console.log("totalMaxReward:", selfDate[0].toString());
            console.log("totalUnclaimed:", selfDate[1].toString());
            console.log("claimable:", selfDate[2].toString());

            await harvest.connect(user).claim();
            console.log("harvest balance:", (await erc20Mock.balanceOf(harvest.address)).toString());
            console.log("user balance:", (await erc20Mock.balanceOf(await user.getAddress())).toString());
            expect(await erc20Mock.balanceOf(harvest.address)).eq(leftTotalToken.sub(claimablePerBlock.mul(skipBlockNum.add(1).add(1))));
            expect(await erc20Mock.balanceOf(await user.getAddress())).eq(mintAmount.add(claimablePerBlock.mul(skipBlockNum.add(1).add(1))));

            await harvest.connect(user).claim();
            console.log("harvest balance:", (await erc20Mock.balanceOf(harvest.address)).toString());
            console.log("user balance:", (await erc20Mock.balanceOf(await user.getAddress())).toString());
            expect(await erc20Mock.balanceOf(harvest.address)).eq(BigNumber.from("0"));
            expect(await erc20Mock.balanceOf(await user.getAddress())).eq(MaxReward);

        });
    })

});
