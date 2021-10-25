// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.6.12;

import { SafeMath } from "@openzeppelin/contracts/math/SafeMath.sol";

/// @title ERC20Mock
///
/// @dev A mock of an ERC20 token which lets anyone burn and mint tokens.
contract ERC20Mock {

  using SafeMath for uint256;

  mapping (address => uint256) public balanceOf;

  mapping (address => mapping (address => uint256)) public allowance;

  uint256 public totalSupply;

  string public name;
  string public symbol;
  uint8 public decimals;

  event Approval(address indexed owner, address indexed spender, uint256 value);
  event Transfer(address indexed from, address indexed to, uint256 value);

  constructor(string memory _name, string memory _symbol, uint8 _decimals) public {
    name = _name;
    symbol = _symbol;
    decimals = _decimals;
  }

  function mint(address _recipient, uint256 _amount) external {
    require(totalSupply + _amount >= totalSupply, "totalSupply exceed");

    totalSupply += _amount;
    balanceOf[_recipient] += _amount;

    emit Transfer(address(0), _recipient, _amount);
  }

  function burn(address _account, uint256 _amount) external {
    require(balanceOf[_account] >= _amount, "balance not enough");

    balanceOf[_account] -= _amount;
    totalSupply -= _amount;

    emit Transfer(_account, address(0), _amount);
  }

  function approve(address _spender, uint256 _value) external returns(bool) {
    allowance[msg.sender][_spender] = _value;
    emit Approval(msg.sender, _spender, _value);
    return true;
  }

  function transfer(address _to, uint256 _value) external returns(bool) {
    _transfer(msg.sender, _to, _value);
    return true;
  }

  function transferFrom(address _from, address _to, uint256 _value) external returns(bool) {
    require(allowance[_from][msg.sender] >= _value, "allowance not enough");

    allowance[_from][msg.sender] -= _value;
    _transfer(_from, _to, _value);

    return true;
  }

  function _transfer(address from, address to, uint256 amount) private {
    require(balanceOf[from] >= amount, "balance not enough");

    balanceOf[from] -= amount;
    balanceOf[to] += amount;

    emit Transfer(from, to, amount);
  }
}
