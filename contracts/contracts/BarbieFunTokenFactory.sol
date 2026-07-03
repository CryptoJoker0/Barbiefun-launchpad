// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {BarbieFunToken} from "./BarbieFunToken.sol";

/// @title BarbieFunTokenFactory
/// @notice Deploys one gas-cheap EIP-1167 minimal-proxy BarbieFunToken clone per
///         launch, atomically with collection of the flat launch fee (in native
///         gas token). Deployed once per supported EVM chain, pointing at the
///         shared BarbieFunToken implementation deployed alongside it.
contract BarbieFunTokenFactory is Ownable, ReentrancyGuard, Pausable {
    /// @notice Address of the BarbieFunToken logic contract that every clone
    /// delegates its calls to. Immutable — set once at deploy time.
    address public immutable tokenImplementation;

    /// @notice Wallet that receives the launch fee for every token created here.
    address public treasury;

    /// @notice Flat native-token fee (in wei) required to create a token.
    /// The frontend computes this off-chain from a live $5 USD quote and passes
    /// it as `msg.value`; the contract itself just enforces a minimum.
    uint256 public launchFee;

    /// @notice All tokens ever created through this factory, in creation order.
    address[] public allTokens;

    /// @notice creator => tokens they created through this factory.
    mapping(address => address[]) public tokensByCreator;

    /// @notice token => the wallet that created it (redundant with Ownable on the
    /// token itself, but cheap to check on-chain without an external call).
    mapping(address => address) public creatorOf;

    event TokenCreated(
        address indexed token,
        address indexed creator,
        string name,
        string symbol,
        uint256 totalSupply,
        uint256 feePaid,
        uint256 timestamp
    );
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event LaunchFeeUpdated(uint256 oldFee, uint256 newFee);
    event FeeSwept(address indexed to, uint256 amount);

    constructor(address tokenImplementation_, address treasury_, uint256 launchFee_, address initialOwner)
        Ownable(initialOwner)
    {
        require(tokenImplementation_ != address(0), "Factory: zero implementation");
        require(treasury_ != address(0), "Factory: zero treasury");
        tokenImplementation = tokenImplementation_;
        treasury = treasury_;
        launchFee = launchFee_;
    }

    /// @notice Deploys a new token clone for the caller and forwards the fee to treasury.
    /// @dev Reentrancy-guarded and pausable. Fee is forwarded immediately (checks-effects-
    ///      interactions: clone + state updates happen before the external transfer).
    /// @param name Token name.
    /// @param symbol Token ticker.
    /// @param totalSupply Fixed total supply, minted in full to `msg.sender`.
    /// @return token Address of the newly deployed token clone.
    function createToken(string calldata name, string calldata symbol, uint256 totalSupply)
        external
        payable
        nonReentrant
        whenNotPaused
        returns (address token)
    {
        require(msg.value >= launchFee, "Factory: insufficient fee");
        require(bytes(name).length > 0, "Factory: empty name");
        require(bytes(symbol).length > 0, "Factory: empty symbol");
        require(totalSupply > 0, "Factory: zero supply");

        token = Clones.clone(tokenImplementation);
        BarbieFunToken(token).initialize(name, symbol, totalSupply, msg.sender);

        allTokens.push(token);
        tokensByCreator[msg.sender].push(token);
        creatorOf[token] = msg.sender;

        emit TokenCreated(token, msg.sender, name, symbol, totalSupply, msg.value, block.timestamp);

        (bool sent,) = treasury.call{value: msg.value}("");
        require(sent, "Factory: fee transfer failed");
    }

    /// @notice Predicts the address a clone would get for the next `createToken`
    /// call from `creator`, useful for the frontend to show the address pre-confirmation.
    /// @dev Uses a deterministic salt derived from the creator + their current
    /// launch count, matched by `createTokenDeterministic` below if ever needed.
    function totalTokens() external view returns (uint256) {
        return allTokens.length;
    }

    function tokensOf(address creator) external view returns (address[] memory) {
        return tokensByCreator[creator];
    }

    // ---------------------------------------------------------------------
    // Admin
    // ---------------------------------------------------------------------

    function setTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Factory: zero treasury");
        emit TreasuryUpdated(treasury, newTreasury);
        treasury = newTreasury;
    }

    function setLaunchFee(uint256 newFee) external onlyOwner {
        emit LaunchFeeUpdated(launchFee, newFee);
        launchFee = newFee;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /// @notice Rescue path for any native token stuck in the contract (should
    /// never happen given fees are forwarded synchronously, but kept as a safety net).
    function sweep(address payable to) external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "Factory: nothing to sweep");
        (bool sent,) = to.call{value: balance}("");
        require(sent, "Factory: sweep failed");
        emit FeeSwept(to, balance);
    }
}
