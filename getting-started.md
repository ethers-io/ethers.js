# Getting Started

### Installing

Hethers' various Classes and Functions are available to import manually from sub-packages under the [@hethers](https://www.npmjs.com/search?q=%40hethersproject%2F) organization but for most projects, the umbrella package is the easiest way to get started.

```typescript
npm install --save @hashgraph/hethers
```

### Importing

**NodeJS**

```typescript
// node.js require
const { hethers } = require('@hashgraph/hethers');

// ES6 or TypeScript
import { hethers } from '@hashgraph/hethers';
```

**Web Browser**

```typescript
// ES6 in the Browser
<script type="module">
    import { hethers } from "hethers.esm.min.js";
    // Your code here...
</script>

// ES3(UMD) in the Browser
<script src="<link>hethers.umd.min.js" type="application/javascript"></script>
```

### Common terminology

| Name         | Purpose                                                                                                                                                                                                                 |   |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | - |
| **Provider** | A Provider (in hethers) is a class which provides an abstraction for a connection to the Hedera Network.                                                                                                                |   |
| **Signer**   | A Signer is a class that (usually) in some way directly or indirectly has access to a private key, which can sign messages and transactions to authorize the network to charge your account hbar to perform operations. |   |
| **Contract** | A Contract is an abstraction that represents a connection to a specific contract on the Hedera Network, so that applications can use it as a normal JavaScript object.                                                  |   |

### Connecting to Hedera Providers

```typescript
// available default providers ['mainnet', 'testnet', 'previewnet']
const defaultProvider = hethers.providers.getDefaultProvider('testnet');

// or you can define the connection properties by yourself
const customProvider = new hethers.providers.HederaProvider(
  nodeId, // AccountLike
  consensusNodeUrl, // string
  mirrorNodeUrl // string
);
```

#### Querying

Once you have a [Provider](application-programming-interface/providers/provider/), you have a read-only connection to the blockchain, which you can use to query the current state, fetch historic logs, look up deployed code and so on.

```typescript
const provider = hethers.providers.getDefaultProvider('testnet');

const balance = await provider.getBalance('0.0.29562194');

const bytecode = await provider.getCode('0x0000000000000000000000000000000001d5a8f0');
```

#### Writing

```typescript
const tx = signer.sendTransaction({
    to: '0.0.29562194',
    value: hethers.utils.parseHbar("1.2")
});
```

### Contracts

A Contract is an abstraction of program code that lives on the Hedera Hashgraph Smart Contract Service.

The [Contract](application-programming-interface/contract-interaction/contract.md) object makes it easier to use an on-chain Contract as a normal JavaScript object, with the methods mapped to encoding and decoding data for you.

If you are familiar with Databases, this is similar to an _Object Relational Mapper_ (ORM).

In order to communicate with the Contract on-chain, this class needs to know what methods are available and how to encode and decode the data, which is what the _Application Binary Interface_ (ABI) provides.

This class is a _meta-class_, which means its methods are constructed at runtime, and when you pass in the ABI to the constructor it uses it to determine which methods to add.

While an on-chain Contract may have many methods available, you can safely ignore any methods you don't need or use, providing a smaller subset of the ABI to the contract.

An ABI often comes from the Solidity compiler, but you can use the Human-Readable ABI in code, which the following examples use.

```typescript
const provider = hethers.providers.getDefaultProvider('testnet');

// The contract address
const erc20Address = '0x0000000000000000000000000000000001d5a8f0';

// The ERC-20 Contract ABI, which is a common contract interface
// for tokens (this is the Human-Readable ABI format)
const erc20Abi = [
    // Some details about the token
    'function name() view returns (string)',
    'function symbol() view returns (string)',

    // Get the account balance
    'function balanceOf(address) view returns (uint)',

    // Send some of your tokens to someone else
    'function transfer(address to, uint amount)',

    // An event triggered whenever anyone transfers to someone else
    'event Transfer(address indexed from, address indexed to, uint amount)'
];

// The Contract object
const contract = new hethers.Contract(erc20Address, erc20Abi, provider);
```

#### Read-Only Methods

```typescript
// The Contract is currently connected to the Provider.
// You need to connect to a Signer, so
// that you can pay for ContractLocalCall transactions.
const contractWithSigner = contract.connect(signer);

// Get the ERC-20 token name
await contractWithSigner.name({gasLimit: 30000});
// 'My Token Name'

// Get the ERC-20 token symbol (for tickers and UIs)
await contractWithSigner.symbol({gasLimit: 30000});
// 'MTN'

// Get the balance of an address
await contractWithSigner.balanceOf(contractWallet.address, {gasLimit: 30000});
// BigNumber { _hex: '0x2710', _isBigNumber: true }
```

#### State Changing Methods

```typescript
const amount = hethers.utils.parseUnits('1.0');

// Send 10**8 amount of tokens to the recipient's address
const tx = contractWithSigner.transfer(
    '0x0000000000000000000000000000000001d5a949',
    amount,
    {gasLimit: 50000}
);
```

#### Listening to Events

```typescript
// Receive an event when ANY transfer occurs
contract.on('Transfer', (from, to, amount, event) => {
    console.log(`${from} sent ${formatHbar(amount)} to ${to}`);
});

// A filter for when a specific address receives tokens
const filter = contract.filters.Transfer(null, signer.address);
// {
//   address: '0x0000000000000000000000000000000001c4fff6',
//   topics: [
//     '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
//     null,
//     '0x0000000000000000000000000000000000000000000000000000000001c42506'
//   ]
// }

// Receive an event when that filter occurs
contract.on(filter, (from, to, amount, event) => {
    // The to will always be "address"
    console.log(`I got ${formatHbar(amount)} from ${from}.`);
});
```

#### Query Historic Events

```typescript
// filter from
const filter = contract.filters.Transfer(signer.address);
// {
//   address: '0x0000000000000000000000000000000001c4fff6',
//   topics: [
//     '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
//     '0x0000000000000000000000000000000000000000000000000000000001c31552'
//   ]
// }

const fromTimestamp = '1645110013.000000000';
const toTimestamp = '1645110014.000000000';
await contract.queryFilter(filter, fromTimestamp, toTimestamp);
// [
//   {
//     timestamp: '1645110013.250941000',
//     address: '0x0000000000000000000000000000000001C4ffF6',
//     data: '0x0000000000000000000000000000000000000000000000000000000000000064',
//     topics: [
//       '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
//       '0x0000000000000000000000000000000000000000000000000000000001c31552',
//       '0x0000000000000000000000000000000000000000000000000000000001c42506'
//     ],
//     logIndex: 0,
//     transactionIndex: 0,
//     removeListener: [Function (anonymous)],
//     getTransaction: [Function (anonymous)],
//     getTransactionReceipt: [Function (anonymous)],
//     event: 'Transfer',
//     eventSignature: 'Transfer(address,address,uint256)',
//     decode: [Function (anonymous)],
//     args: [
//       '0x0000000000000000000000000000000001C31552',
//       '0x0000000000000000000000000000000001C42506',
//       [BigNumber],
//       from: '0x0000000000000000000000000000000001C31552',
//       to: '0x0000000000000000000000000000000001C42506',
//       value: [BigNumber]
//     ]
//   }
// ]
```

### Signing Messages

```typescript
// To sign a simple string, which are used for
// logging into a service, pass the string in.
signer.signMessage('message');
// '0xe1c58c8ea54a270eb99c14e1e6f7bbb14f2a16225556e5e7cc27e77d0f57cad4611fd46c747430e6b9df9cd51fa8430c993f664789034525629742f3ebb0be6d1c'

// A common case is also signing a hash, which is 32
// bytes. It is important to note, that to sign binary
// data it MUST be an Array (or TypedArray)

// This string is 66 characters long
const message = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

// This array representation is 32 bytes long
const messageBytes = hethers.utils.arrayify(message);

// To sign a hash, you most often want to sign the bytes
const signature = await signer.signMessage(messageBytes);
// '0x6a8241ec5885dd54f59dd0a4219490bba63e19473de9ba6895c5bfa5fb4fe0c03e761e79f1a5655b2b8e7119adbd1ec09df829884a4d514d45ec89b66eb951791b'
```
