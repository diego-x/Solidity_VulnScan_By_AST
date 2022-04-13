pragma solidity >=0.7.0 <0.9.0;

contract Storage {

    uint256 number;

    function store(uint256 num , uint256 num1) public payable {
        require(num > 0);
        require(num1 > 0);
        number = num * num1;
    }


    function retrieve() public view returns (uint256){
        return number;
    }
}