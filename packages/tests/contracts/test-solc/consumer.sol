pragma solidity ^0.5.0;

import "./libraries/lib.sol";

contract Consumer {
  function f() public {
    Lib.f();
  }
}
