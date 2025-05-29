// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract BountyVault is EIP712 {
    address public trustedSigner;

    struct Bounty {
        address reciever;
        uint256 amount;
    }

    mapping(string githubIssue => Bounty bounty) s_bounties;
    bytes32 private constant MESSAGE_TYPE_HASH = keccak256("Bounty(address account,uint256 amount)");

    /**
     *
     * @param _trustedSigner This is the backend account
     */
    constructor(address _trustedSigner) EIP712("BountyVault", "1") {
        trustedSigner = _trustedSigner;
    }

    event Bounty_Created();
    event Bounty_Released();

    error Invalid_Bounty_Amount();
    error Bounty_Already_Created();

    /**
     *
     * @param githubIssue Each github Issue will have their own bountyAmount
     * @param bountyAmount This is the value of bounty Amount
     */
    function createBounty(string memory githubIssue, uint256 bountyAmount) external payable {
        if (bountyAmount == 0) revert Invalid_Bounty_Amount();
        if (s_bounties[githubIssue].amount != 0) revert Bounty_Already_Created();

        s_bounties[githubIssue].amount = bountyAmount;
        emit Bounty_Created();
    }

    // Helper function
    function getMessageHash(address account, uint256 amount) public view returns (bytes32 digest) {
        // the other method using struct is just a syntatic sugar BountyRelease({account: account,amount:amount}) == abi.encode(MESSAGE_TYPE_HASH, account, amount)
        digest = _hashTypedDataV4(keccak256(abi.encode(MESSAGE_TYPE_HASH, account, amount)));
    }

    function _isValidSignature(address account, bytes32 digest, bytes memory signature) internal pure returns (bool) {
        // check if s is restricted to prevent signature malleability . Meaning existance of two different valid signature in seckp-256k curve
        (address actualSigner,,) = ECDSA.tryRecover(digest, signature);
        return actualSigner == account;
    }

    function getBounty(string memory issue) external view returns (Bounty memory) {
        return s_bounties[issue];
    }
}
