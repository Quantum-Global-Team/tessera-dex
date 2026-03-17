// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title MockERC20
/// @notice A simple ERC20 token with public mint for testing tokenized forex pairs
/// @dev Used to deploy tUSD, tEUR, tGBP, tJPY, USDC on testnets
contract MockERC20 is ERC20, Ownable {
    uint8 private immutable _decimals;

    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_
    ) ERC20(name_, symbol_) Ownable(msg.sender) {
        _decimals = decimals_;
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    /// @notice Mint tokens to a recipient (for testing only)
    /// @param to The address to receive the minted tokens
    /// @param amount The amount to mint (in smallest units)
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /// @notice Burn tokens from caller
    /// @param amount The amount to burn
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
