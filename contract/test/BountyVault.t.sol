// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import {BountyVault} from "../src/BountyVault.sol";

contract BountyVaultTest is Test {
    BountyVault vault;

    address owner = address(0xABCD);
    address sender = address(0x1111);
    address receiver = address(0x2222);
    bytes32 bountyId;

    function setUp() public {
        vm.prank(owner);
        vault = new BountyVault(owner);
        bountyId = keccak256(abi.encodePacked(sender, receiver, "issue-123"));
    }

    function testCreateBounty() public {
        string memory githubIssue = "github Issue";
        vm.deal(sender, 15 ether);
        vault.createBounty(githubIssue, 2 ether);
        address expectedReciever = address(0);
        BountyVault.Bounty memory bounty = vault.getBounty(githubIssue);
        assertEq(bounty.reciever, expectedReciever);
    }
}
