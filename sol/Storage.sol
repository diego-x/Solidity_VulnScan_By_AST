// SPDX-License-Identifier: MIT

contract game {
    address public owner;
    
    constructor () public {
        owner = msg.sender;
    }
    function () public payable {}
        function withdrawAll(address _recipient) public {
            require(tx.origin == owner);
            _recipient.transfer(this.balance);
        }
}