-----

Documentation: [html](https://docs.ethers.io/)

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
const abi = [
  "event Transfer(address indexed src, address indexed dst, uint val)"
];

const contract = new Contract(tokenAddress, abi, provider);

// List all token transfers *from* myAddress
contract.filters.Transfer(myAddress)
// {
//   address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
//   topics: [
//     '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
//     '0x0000000000000000000000008ba1f109551bd432803012645ac136ddd64dba72'
//   ]
// }

// List all token transfers *to* myAddress:
contract.filters.Transfer(null, myAddress)
// {
//   address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
//   topics: [
//     '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
//     null,
//     '0x0000000000000000000000008ba1f109551bd432803012645ac136ddd64dba72'
//   ]
// }

// List all token transfers *from* myAddress *to* otherAddress:
contract.filters.Transfer(myAddress, otherAddress)
// {
//   address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
//   topics: [
//     '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
//     '0x0000000000000000000000008ba1f109551bd432803012645ac136ddd64dba72',
//     '0x000000000000000000000000ea517d5a070e6705cc5467858681ed953d285eb9'
//   ]
// }

// List all token transfers *to* myAddress OR otherAddress:
contract.filters.Transfer(null, [ myAddress, otherAddress ])
// {
//   address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
//   topics: [
//     '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
//     null,
//     [
//       '0x0000000000000000000000008ba1f109551bd432803012645ac136ddd64dba72',
//       '0x000000000000000000000000ea517d5a070e6705cc5467858681ed953d285eb9'
//     ]
//   ]
// }
```

### Other Things? TODO

