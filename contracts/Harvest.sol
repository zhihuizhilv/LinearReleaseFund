// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.12;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeMath } from "@openzeppelin/contracts/math/SafeMath.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

contract Harvest {
  using SafeERC20 for IERC20;
  using SafeMath for uint256;

  // 总量是1亿，直到领取完全结束
  uint256 public MAXREWARD = 100000000 * (10**18);

  // 大概每秒产生3个区块，根据规则计算一年产生的总区块数
  uint public constant blocksPerYear = 60 * 60 * 24 * 365 / 3;

  // 每个区块百分之一能获得的收益额度
  uint256 public rewardRate = MAXREWARD / 100 / blocksPerYear;

  address public owner;
  address public pendingOwner;
  IERC20 public dmtToken;

  struct Data {
    uint256 fundRate;
    uint256 totalClaimed;
    uint256 lastBlock;
  }

  mapping(address => Data) public funders;

  event NewOwner(address indexed oldOwner, address indexed owner);

  event NewPendingOwner(address indexed pendingOwner);

  event RewardRateUpdated(uint256 rewardRate);

  event NewFunder(address indexed funder, uint256 fundRate);
  
  event RemoveFunder(address indexed funder);

  event TokensClaimed(address indexed funder, uint256 amount);

  event TokensWithdraw(address indexed dst, uint256 contract_balance);

  // 仅管理员操作
  modifier onlyOwner() {
    require(msg.sender == owner, "Ownable: only owner");
    _;
  }

  // 仅候选管理员操作
  modifier onlyPendingOwner() {
    require(msg.sender == pendingOwner, "Ownable: only pending owner");
    _;
  }

  // 仅投资人操作
  modifier onlyFunder() {
    require(funders[msg.sender].lastBlock > 0, "Ownable: only funder");
    _;
  }

  // 投资人不能重复
  modifier funderDoesNotExist(address funder) {
      require(funders[funder].lastBlock <= 0);
      _;
  }

  constructor(IERC20 _dmtToken) public {
    dmtToken = _dmtToken;
    owner = msg.sender;

    emit NewOwner(address(0), owner);
  }

  // 设置候选管理员
  function setPendingOwner(address _pendingOwner) external onlyOwner {
    require(_pendingOwner != address(0), "Ownable: pending owner is 0");
    pendingOwner = _pendingOwner;

    emit NewPendingOwner(pendingOwner);
  }

  // 候选管理员变为正式管理员
  function acceptOwner() external onlyPendingOwner {
    address old = owner;
    owner = msg.sender;
    pendingOwner = address(0);

    emit NewOwner(old, owner);
  }

  // 添加投资人（钱包地址，分配比例、区块高度）
  function addFunder(address _funder, uint256 _fundRate) external onlyOwner funderDoesNotExist(_funder) {
    Data storage funder = funders[_funder];

    funder.fundRate = _fundRate;
    funder.totalClaimed = 0;
    funder.lastBlock = block.number;

    emit NewFunder(_funder, _fundRate);
  }

  // 删除投资人
  function delFunder(address _funder) external onlyOwner {
    delete funders[_funder];
    emit RemoveFunder(_funder);
  }

  // 获取投资人相关数据
  function selfData(address _funder) external view returns (uint256, uint256, uint256) {
    Data storage funder = funders[_funder];
    
    // 最多领取收益数
    uint256 self_max_reward = MAXREWARD.div(100).mul(funder.fundRate);

    // 未领取的收益数总数
    uint256 self_max_unclaimed = self_max_reward.sub(funder.totalClaimed);

    // 当前可以领取的收益数
    uint256 diffBlock = block.number.sub(funder.lastBlock);
    uint256 self_active_reward = rewardRate.mul(funder.fundRate).mul(diffBlock);

    return (self_max_reward, self_max_unclaimed, self_active_reward);
  }

  // 投资人领取收益
  function claim() external onlyFunder() {

    Data storage funder = funders[msg.sender];
    uint256 contract_balance = dmtToken.balanceOf( address(this) );

    uint256 totalUnclaimed = MAXREWARD.div(100).mul(funder.fundRate).sub(funder.totalClaimed);
    uint256 diffBlock = block.number.sub(funder.lastBlock);
    uint256 amount = rewardRate.mul(funder.fundRate).mul(diffBlock);

    // 本次领取收益 大于 剩余领取收益总额
    if(amount > totalUnclaimed){
      amount = totalUnclaimed;
    }

    if(contract_balance <= amount ){
      amount = contract_balance;
    }

    require(amount > 0 ,"Your receivable income is zero");

    funder.totalClaimed = funder.totalClaimed.add(amount);
    funder.lastBlock = block.number;
    
    dmtToken.safeTransfer(msg.sender, amount);

    emit TokensClaimed(msg.sender, amount);
  }

  // 提现全部余额到指定地址
  function withdraw(address dst) external onlyOwner {
    uint256 contract_balance = dmtToken.balanceOf( address(this) );
    dmtToken.safeTransfer( dst, contract_balance );
    emit TokensWithdraw(dst, contract_balance);
  }
}
