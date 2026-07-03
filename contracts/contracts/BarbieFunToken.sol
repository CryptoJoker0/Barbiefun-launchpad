// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {ERC20BurnableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/// @title BarbieFunToken
/// @notice Minimal-proxy-friendly ERC20 deployed per-launch by BarbieFunTokenFactory.
/// @dev Uses the OpenZeppelin Upgradeable/Initializable pattern *only* so it can be
///      cheaply cloned via EIP-1167 minimal proxies (each launch gets its own token
///      contract, but the bytecode is shared). It is NOT meant to be upgraded after
///      creation — there is no proxy admin, no UUPS logic and no way to change the
///      implementation a clone points to once deployed. "Upgradeable" here refers
///      strictly to the initializer pattern required for gas-efficient cloning.
contract BarbieFunToken is Initializable, ERC20Upgradeable, ERC20BurnableUpgradeable, OwnableUpgradeable {
    /// @dev Locks the implementation contract itself so it can never be initialized
    /// or used directly — only clones created by the factory are meant to hold state.
    constructor() {
        _disableInitializers();
    }

    /// @notice One-time initializer, called by the factory immediately after cloning.
    /// @param name_ Token name chosen by the creator.
    /// @param symbol_ Token ticker chosen by the creator.
    /// @param totalSupply_ Fixed total supply, minted entirely to `creator` at launch.
    /// @param creator Wallet that becomes the token owner and receives the full supply.
    function initialize(
        string calldata name_,
        string calldata symbol_,
        uint256 totalSupply_,
        address creator
    ) external initializer {
        require(creator != address(0), "BarbieFunToken: zero creator");
        require(totalSupply_ > 0, "BarbieFunToken: zero supply");

        __ERC20_init(name_, symbol_);
        __ERC20Burnable_init();
        __Ownable_init(creator);

        _mint(creator, totalSupply_);
    }
}
