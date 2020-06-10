-----

Documentation: [html](https://docs-beta.ethers.io/)

-----

Quick Start
===========

Connecting to Ethereum: Metamask
--------------------------------

```
// A Web3Provider wraps a standard Web3 provider, which is
// what Metamask injects into every page you visit as window.ethereum
const provider = new ethers.providers.Web3Provider(window.ethereum)

// The Metamask plugin also allows signing transactions to send ether
// and pay to change state within the blockchain. For this, we need
// the account signer...
const signer = provider.getSigner()
```

### Querying the Blockchain

```
// <hide>
const provider = ethers.getDefaultProvider();
// </hide>

// Look up the current block number
provider.getBlockNumber()

// Get the balance of an account (by address or ENS name)
provider.getBalance("ethers.eth")
```

### Writing to the Blockchain

```
// Send 1 ether to an ens name.
const tx = signer.sendTransaction({
    to: "ricmoo.firefly.eth",
    value: ethers.utils.parseEther("1.0")
});
```

Contracts
---------

### Connecting to a Contract

```
// The ERC-20 Contract ABI, which is a common contract interface
// for tokens.
const abi = [
    // Some simple details about the token
    "function namd() view returns (string)",
    "function symbol() view returns (string)",

    // Get the account balance
    "function balanceOf(address) view returns (uint)",

    // Send some of your tokens to someone else
    "function transfer(address to, uint amount")",

    // An event triggered whenever anyone transfers to someone else
    "event Transfer(address indexed from, address indexed to, uint amount)"
];

const contract = new ethers.Contract(address, abi, provider);

const contract = new ethers.Contract(address, abi, provider);
```

### Read-Only Methods

```
// <hide>
// </hide>

const contract = new Contract("dai.tokens.ethers.eth", abi, provider);

contract.name()
//!

contract.symbol()
//!

contract.balanceOf("ricmoo.firefly.eth")
//!
```

### State Changing Methods

### Listening to Events

```
// <hide>
const contract = ...
// </hide>

// Receive an event when ANY transfer occurs
contract.on("Transfer", (from, to, amount, event) => {
    console.log(`${ from } sent ${ formatEther(amount) } to ${ to}`);
});

// Receive an event when a specific address receives a token
const filter = contract.filters.Transfer(null, address)
contract.on(filter, (from, to, amount, event) => {
    // The to will always be "address"
    console.log(`I got ${ formatEther(amount) } from ${ from }.`);
});
```

### Listing Historic Events

```
// List all transfers from anyone to anyone in the first XXX
contract.queryFilter("Transfer", 0, XXX)
//!
```

```
// <hide>
const contract = ...
// </hide>

const address = signer.getAddress()

// Filter for all token transfers we've sent
const filterFrom = contract.filter.Transfer(address, null);
// <hide>
filterFrom
// </hide>
//!

// Filter for all token transfers we've received
const filterTo = contract.filter.Transfer(null, address);
// <hide>
filterTo
// </hide>
//!

// List all transfers we've sent between ...
contract.queryFilter(filterFrom, 0, 100000)
//!

// List all transfers we've received in blockhash XXX
contract.queryFilter(filterTo, XXX)
//!
```

Signing Messages
----------------

