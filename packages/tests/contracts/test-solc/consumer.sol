pragma solidity ^0.7.1;

import "./libraries/lib.sol";

contract Consumer {
  function f() public {
    Lib.f();
  }
}
