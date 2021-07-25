-----

Documentation: [html](https://docs.ethers.io/)

-----

Events
======

Logs and Filtering
------------------

### Filters

Example Log Matching



```javascript
//_hide: const tokenAddress = ethers.constants.AddressZero;
//_hide: const myAddress = ethers.constants.AddressZero;
//_hide: const myOtherAddress = ethers.constants.AddressZero;
//_hide: const id = ethers.utils.id;
//_hide: const hexZeroPad = ethers.utils.hexZeroPad;

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
};

// List all token transfers  *to*  myAddress:
filter = {
    address: tokenAddress,
    topics: [
        id("Transfer(address,address,uint256)"),
        null,
        hexZeroPad(myAddress, 32)
    ]
};

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
};
```


To simplify life, ..., explain here, the contract API


```javascript
//_hide: const tokenAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F"; /* DAI */
//_hide: const myAddress = "0x8ba1f109551bD432803012645Ac136ddd64DBA72";
//_hide: const otherAddress = "0xEA517D5a070e6705Cc5467858681Ed953d285Eb9";
//_hide: const provider = ethers.getDefaultProvider();
//_hide: const Contract = ethers.Contract;

abi = [
  "event Transfer(address indexed src, address indexed dst, uint val)"
];

contract = new Contract(tokenAddress, abi, provider);

// List all token transfers *from* myAddress
//_result:
contract.filters.Transfer(myAddress)
//_log:

// List all token transfers *to* myAddress:
//_result:
contract.filters.Transfer(null, myAddress)
//_log:

// List all token transfers *from* myAddress *to* otherAddress:
//_result:
contract.filters.Transfer(myAddress, otherAddress)
//_log:

// List all token transfers *to* myAddress OR otherAddress:
//_result:
contract.filters.Transfer(null, [ myAddress, otherAddress ])
//_log:
```

Solidity Topics
---------------

### Other Things? TODO

