pragma solidity ^0.4.24;

// Example purpose contract
contract Revert {
 
    uint public aNumber;
    address public owner;

    constructor(address ownerAddress) public {
        require(ownerAddress != address(0), "Owner's address should not be zero");

        owner = ownerAddress;
    }
 
    function set(uint number) external {
        require(number > 5, "Number is not bigger than 5");
        require(number > 7, "Number should be bigger than 7");

        aNumber = number;
    }

    function isEnoughBigger() external view returns(bool) {
        require(aNumber > 10, "Number is not enough bigger");

        return true;
    }   
}