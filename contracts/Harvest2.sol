// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.12;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeMath } from "@openzeppelin/contracts/math/SafeMath.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

// Pacific项目投资人释放
contract Harvest2 {
  using SafeERC20 for IERC20;
  using SafeMath for uint256;

  // 总量剩余量，直到领取完全结束
  uint256 public immutable MaxReward;

  // 每个季度百分之一能获得的收益额度
  uint256 public rewardRate;

  uint256 public totalRate;

  address public owner;
  address public pendingOwner;
  IERC20 public dmtToken;
  bool public pause;
  bool public onlyOnceAirdrop;

  // 每个季度区块高度
  uint public perSeasonBlocks = 1 years / 4 / 3;
  uint public seasonBlocks1 = perSeasonBlocks * 1;
  uint public seasonBlocks2 = perSeasonBlocks * 2;
  uint public seasonBlocks3 = perSeasonBlocks * 3;
  uint public seasonBlocks4 = perSeasonBlocks * 4;

  struct Data {
    uint256 fundRate;
    uint256 totalAmount;
    uint256 totalClaimed;
    uint256 lastBlock;
    bool airdrop;
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

  modifier onlyValidState() {
    require(!pause, "has paused");
    _;
  }

  // 只能执行一次
  modifier onlyOnce(address _funder) {
    Data storage funder = funders[_funder];
    require(!funder.airdrop, "It can only be executed once");
    _;
  }

  constructor(IERC20 _dmtToken, uint _totalReward, uint _totalDays) public {
    MaxReward = _totalReward;
    dmtToken = _dmtToken;
    owner = msg.sender;
    pause = false;

    rewardRate = _totalReward / 4 / 100;

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

  function setPause(bool _pause) external onlyOwner {
    pause = _pause;
  }

  // 添加投资人（钱包地址，分配比例、区块高度）
  function addFunder(address _funder, uint256 _fundRate) external onlyOwner {
    require(funders[_funder].lastBlock == 0, "funder exist already");
    require(_fundRate > 0, "invalid fund rate");
    require(totalRate.add(_fundRate) <= 100, "total rate over");

    Data storage funder = funders[_funder];

    funder.fundRate = _fundRate;
    funder.totalAmount = 0;
    funder.totalClaimed = 0;
    funder.lastBlock = block.number;
    funder.airdrop = false;

    totalRate = totalRate.add(_fundRate);
    emit NewFunder(_funder, _fundRate);
  }

  // 删除投资人
  function delFunder(address _funder) external onlyOwner {
    Data storage funder = funders[_funder];
    totalRate = totalRate.sub(funder.fundRate);
    delete funders[_funder];
    emit RemoveFunder(_funder);
  }

  // 首次释放，只能执行一次（总金额的20%乘以各自比例）
  function firstRelease(address _funder) external onlyOwner onlyOnce(_funder) {
    Data storage funder = funders[msg.sender];
    uint256 firstReward = MaxReward.div(100).mul(20);
    funder.totalAmount = firstReward.div(100).mul(funder.fundRate);
    funder.airdrop = true;
  }

  // 更新投资人总领取额度
  function updateFunderAmount(address _funder) private returns (uint256, uint256, uint256) {
    Data storage funder = funders[_funder];

    // 每个季度释放20%，共4次
    uint256 seasonReward = MaxReward.div(100).mul(20);

    // 该投资人每个季度释放额度
    uint256 selfSeasonAmount = seasonReward.div(100).mul(funder.fundRate);

    // 创建时到当前区块高度的差值
    uint256 diffBlock = block.number.sub(funder.lastBlock);

    // 第1季度时
    if ( diffBlock >= seasonBlocks1 && diffBlock < seasonBlocks2 ) {
      funder.totalAmount = selfSeasonAmount.mul(2);
    } 
    // 第2季度时
    else if(diffBlock >= seasonBlocks2 && diffBlock < seasonBlocks3 ) {
      funder.totalAmount = selfSeasonAmount.mul(3);
    }
    // 第3季度时
    else if(diffBlock >= seasonBlocks3 && diffBlock < seasonBlocks4 ) {
      funder.totalAmount = selfSeasonAmount.mul(4);
    }
    // 第4季度时
    else if(diffBlock >= seasonBlocks4) {
      funder.totalAmount = selfSeasonAmount.mul(5);
    }
  }

  // 获取投资人相关数据
  function selfData(address _funder) external view returns (uint256, uint256, uint256) {
    Data storage funder = funders[_funder];

    updateFunderAmount(_funder);

    // 最多领取收益数
    uint256 self_max_reward = MaxReward.div(100).mul(funder.fundRate);

    // 当前总收益数
    uint256 self_total_reward = funder.totalAmount;

    // 已领取收益总数
    uint256 self_total_claimed = funder.totalClaimed;

    // 未领取的收益数总数
    uint256 self_total_unclaimed = self_total_reward.sub(self_total_claimed);

    return (self_max_reward, self_total_reward, self_total_claimed, self_total_unclaimed);
  }

  // 投资人领取收益
  function claim() external onlyFunder onlyValidState {

    uint256 contract_balance = dmtToken.balanceOf( address(this) );

    Data storage funder = funders[msg.sender];

    updateFunderAmount(msg.sender);

    // 当前总收益数
    uint256 self_total_reward = funder.totalAmount;

    // 已领取收益总数
    uint256 self_total_claimed = funder.totalClaimed;

    // 未领取的收益数总数
    uint256 amount = self_total_reward.sub(self_total_claimed);

    require(amount > 0 ,"Your receivable income is zero");

    require(self_total_claimed <= self_total_reward ,"Can't exceed your total amount");

    // 本次领取收益 大于 合约余额时
    if(amount > contract_balance){
      amount = contract_balance;
    }

    funder.totalClaimed = funder.totalClaimed.add(amount);

    dmtToken.safeTransfer(msg.sender, amount);

    emit TokensClaimed(msg.sender, amount);
  }

  // 提现全部余额到指定地址
  function withdraw(
    address token,
    address payable to,
    uint amount
  ) external onlyOwner {
    if (token == address(0)) {
      to.transfer(amount);
    } else {
      IERC20(token).safeTransfer(to, amount);
    }
  }
}
