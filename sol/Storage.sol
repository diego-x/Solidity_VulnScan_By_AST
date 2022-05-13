// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EtherStore {
    mapping(address => uint) public balances;

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw(address test) public {
        uint bal = balances[msg.sender];
        require(bal > 0);

        (bool sent,) = msg.sender.call.value(222)(); // Vulnerability of re-entrancy
        require(sent, "Failed to send Ether");

        balances[test] = 0;
    }

    // Helper function to check the balance of this contract
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}