-----

Documentation: [html](https://docs-beta.ethers.io/)

-----

Getting Started
===============

Installing
----------

```
/home/ricmoo> npm install --save ethers@next
```

Importing
---------

### Node.js

```
const { ethers } = require("ethers");
```

```
import { ethers } from "ethers";
```

### Web Browser

```
<script src="https://cdn.ethers.io/lib/ethers-5.0.esm.min.js"
        type="application/javascipt"></script>
```

```
<script src="https://cdn.ethers.io/lib/ethers-5.0.umd.min.js"
        type="application/javascipt"></script>
```

Common Terminology
------------------

Common Terms



Connecting to Ethereum: Metamask
--------------------------------

```
// A Web3Provider wraps a standard Web3 provider, which is
// what Metamask injects as window.ethereum into each page
const provider = new ethers.providers.Web3Provider(window.ethereum)

// The Metamask plugin also allows signing transactions to
// send ether and pay to change state within the blockchain.
// For this, we need the account signer...
const signer = provider.getSigner()
```

### Querying the Blockchain

```javascript
// Look up the current block number
provider.getBlockNumber()
//!

// Get the balance of an account (by address or ENS name)
balance = await provider.getBalance("ethers.eth")
//! async balance

// Often you will need to format the output for the user
// which prefer to see values in ether (instead of wei)
ethers.utils.formatEther(balance)
//!

// Or if a user enters a string in an input field, you may need
// to convert it from ether (as a string) to wei (as a BigNumber)
ethers.utils.parseEther("1.0")
//!
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

```javascript
// We can use an ENS name for the contract address
const daiAddress = "dai.tokens.ethers.eth";

// The ERC-20 Contract ABI, which is a common contract interface
// for tokens (this is the Human-Readable ABI format)
const daiAbi = [
  // Some simple details about the token
  "function name() view returns (string)",
  "function symbol() view returns (string)",

  // Get the account balance
  "function balanceOf(address) view returns (uint)",

  // Send some of your tokens to someone else
  "function transfer(address to, uint amount)",

  // An event triggered whenever anyone transfers to someone else
  "event Transfer(address indexed from, address indexed to, uint amount)"
];

// The Contract object
const daiContract = new ethers.Contract(daiAddress, daiAbi, provider);
```

### Read-Only Methods

```javascript
// <hide>
const daiAbi = [
  // Some simple details about the token
  "function name() view returns (string)",
  "function symbol() view returns (string)",

  // Get the account balance
  "function balanceOf(address) view returns (uint)",
];
const daiContract = new ethers.Contract("dai.tokens.ethers.eth", daiAbi, provider);
// </hide>

// Get the ERC-20 token name
daiContract.name()
//!

// Get the ERC-20 token synbol (for tickers and UIs)
daiContract.symbol()
//!

// Get the balance of an address
balance = await daiContract.balanceOf("ricmoo.firefly.eth")
//! async balance

// Format the DAI for displaying to the user
ethers.utils.formatUnits(balance, 18)
//!
```

### State Changing Methods

```
// The DAI Contract is currently connected to the Provider,
// which is read-only. We need to connect to a Signer, so
// that we can pay to send state-changing transactions.
const daiWithSigner = contract.connect(signer);

// Each DAI has 18 decimal places
const dai = ethers.utils.parseUnits("1.0", 18);

// Send 1 DAI to "ricmoo.firefly.eth"
tx = daiWithSigner.transfer("ricmoo.firefly.eth", dai);
```

### Listening to Events

```javascript
// <hide>
const daiAbi = [
  "event Transfer(address indexed, address indexed, uint256)"
];
const daiContract = new ethers.Contract("dai.tokens.ethers.eth", daiAbi, provider);
const formatEther = ethers.utils.formatEther;
// </hide>

// Receive an event when ANY transfer occurs
daiContract.on("Transfer", (from, to, amount, event) => {
    console.log(`${ from } sent ${ formatEther(amount) } to ${ to}`);
    // The event object contains the verbatim log data, the
    // EventFragment and functions to fetch the block,
    // transaction and receipt and event functions
});

// A filter for when a specific address receives tokens
myAddress = "0x8ba1f109551bD432803012645Ac136ddd64DBA72";
filter = daiContract.filters.Transfer(null, myAddress)
// <hide>
filter
// </hide>
//!

// Receive an event when that filter occurs
daiContract.on(filter, (from, to, amount, event) => {
    // The to will always be "address"
    console.log(`I got ${ formatEther(amount) } from ${ from }.`);
});

// <hide>
// Don't want to block the docs from compiling...
daiContract.removeAllListeners();
// </hide>
```

### Query Historic Events

```javascript
// <hide>
const signer = new ethers.VoidSigner("0x8ba1f109551bD432803012645Ac136ddd64DBA72");
const daiAbi = [
  "event Transfer(address indexed, address indexed, uint256)"
];
const daiContract = new ethers.Contract("dai.tokens.ethers.eth", daiAbi, provider);
//!
// </hide>

// Get the address of the Signer
myAddress = await signer.getAddress()
//! async myAddress

// Filter for all token transfers to me
filterFrom = daiContract.filters.Transfer(myAddress, null);
// <hide>
filterFrom
// </hide>
//!

// Filter for all token transfers from me
filterTo = daiContract.filters.Transfer(null, myAddress);
// <hide>
filterTo
// </hide>
//!

// List all transfers sent from me a specific block range
daiContract.queryFilter(filterFrom, 9843470, 9843480)
//!

//
// The following have had the results omitted due to the
// number of entries; but they provide some useful examples
//

// List all transfers I sent in the last 10,000 blocks
daiContract.queryFilter(filterFrom, -10000)

// List all transfers ever sent to me
daiContract.queryFilter(filterTo)
```

Signing Messages
----------------

```javascript
// <hide>
const signer = ethers.Wallet.createRandom();
//!
// </hide>

// To sign a simple string, which can often be used for
// logging into a service, such as CryptoKitties simply
// pass the string in.
signature = await signer.signMessage("Hello World");
//! async signature

//
// A common case is also signing a hash, which is 32
// bytes. It is important to note, that to sign binary
// data it MUST be an Array (or TypedArray)
//

// This string is 66 chacacters long
message = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"

// This array representation is 32 bytes long
messageBytes = ethers.utils.arrayify(message);
//!

// To sign a hash, you most often want to sign the bytes
signature = await signer.signMessage(messageBytes)
//! async signature
```

