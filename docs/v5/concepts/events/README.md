-----

Documentation: [html](https://docs-beta.ethers.io/)

-----

Events
======

Solidity Topics
---------------

Logs and Filtering
------------------

### Filters

Example Log Matching



```javascript
// <hide>
const tokenAddress = ethers.constants.AddressZero;
const myAddress = ethers.constants.AddressZero;
const myOtherAddress = ethers.constants.AddressZero;
const id = ethers.utils.id;
const hexZeroPad = ethers.utils.hexZeroPad;
// </hide>

// Short example of manually creating filters for an ERC-20
// Transfer event.
//
// Most users should generally use the Contract API to
// compute filters, as it is much simpler, but this is
// provided as an illustration for those curious. See
// below for examples of the equivalent Contract API.

// ERC-20:
//   Transfer(address indexed src, address indexed dst, uint val)
//
// -------------------^
// ----------------------------------------^
//
// Notice that only *src* and *dst* are *indexed*, so ONLY they
// qualify for filtering.
//
// Also, note that in Solidity an Event uses the first topic to
// identify the Event name; for Transfer this will be:
//   id("Transfer(address,address,uint256)")
//
// Other Notes:
//  - A topic must be 32 bytes; so shorter types must be padded

// List all token transfers  *from*  myAddress
filter = {
    address: tokenAddress,
    topics: [
        id("Transfer(address,address,uint256)"),
        hexZeroPad(myAddress, 32)
    ]
}

// List all token transfers  *to*  myAddress:
filter = {
    address: tokenAddress,
    topics: [
        id("Transfer(address,address,uint256)"),
        null,
        hexZeroPad(myAddress, 32)
    ]
}

// List all token transfers  *to*  myAddress or myOtherAddress:
filter = {
    address: tokenAddress,
    topics: [
        id("Transfer(address,address,uint256)"),
        null,
        [
            hexZeroPad(myAddress, 32),
            hexZeroPad(myOtherAddress, 32),
        ]
    ]
}
```


To simplify life, ..., explain here, the contract API


```javascript
// <hide>
const tokenAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F"; // DAI
const myAddress = "0x8ba1f109551bD432803012645Ac136ddd64DBA72";
const otherAddress = "0xEA517D5a070e6705Cc5467858681Ed953d285Eb9";
const provider = ethers.getDefaultProvider();
const Contract = ethers.Contract;
// </hide>

const abi = [
  "event Transfer(address indexed src, address indexed dst, uint val)"
];

const contract = new Contract(tokenAddress, abi, provider);

// List all token transfers *from* myAddress
contract.filters.Transfer(myAddress)
//!

// List all token transfers *to* myAddress:
contract.filters.Transfer(null, myAddress)
//!

// List all token transfers *from* myAddress *to* otherAddress:
contract.filters.Transfer(myAddress, otherAddress)
//!

// List all token transfers *to* myAddress OR otherAddress:
contract.filters.Transfer(null, [ myAddress, otherAddress ])
//!
```

### Other Things? TODO

