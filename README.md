ethers-wallet
=============

Complete Ethereum wallet implementation in JavaScript.

Features
- Keep your private keys in the browser
- Small (~155kb compressed; hopefully under 100kb soon)
- MIT licensed (with a few exceptions, which we are migrating off of; see below)

*NOTE: This is still very beta; please only use it on the testnet for now, or with VERY small amounts of ether on the livenet that you are willing to lose due to bugs.*


Wallet API
----------

```javascript
// A private key can be specified as a 32 byte buffer or hexidecimal string
var privateKey = new Wallet.utils.Buffer([
    0x31, 0x41, 0x59, 0x26, 0x53, 0x58, 0x97, 0x93, 
    0x23, 0x84, 0x62, 0x64, 0x33, 0x83, 0x27, 0x95,
    0x02, 0x88, 0x41, 0x97, 0x16, 0x93, 0x99, 0x37,
    0x51, 0x05, 0x82, 0x09, 0x74, 0x94, 0x45, 0x92
])

// or equivalently:
var privateKey = '0x3141592653589793238462643383279502884197169399375105820974944592'

// Create a wallet object
var wallet = new Wallet(privateKey)

// Wallet address
console.log(wallet.address)
/// "0x7357589f8e367c2C31F51242fB77B350A11830F3"

// ICAP Addresses 
Wallet.getIcapAddress(wallet.address)
/// "XE39DH16QOXYG5JY9BYY6JGZW8ORUPBX71V"

Wallet.getIcapAddress("XE39DH16QOXYG5JY9BYY6JGZW8ORUPBX71V")
/// "XE39DH16QOXYG5JY9BYY6JGZW8ORUPBX71V"

// Get checksummed address (from ICAP)
Wallet.getAddress("XE39DH16QOXYG5JY9BYY6JGZW8ORUPBX71V")
/// "0x7357589f8e367c2C31F51242fB77B350A11830F3"

// Get checksummed addresses (from unchecksumed)
Wallet.getAddress("0x7357589f8e367c2c31f51242fb77b350a11830f3")
/// "0x7357589f8e367c2C31F51242fB77B350A11830F3"

// Detect address checksum errors (notice the last "f" should be lowercase)
Wallet.getAddress('0x7357589f8e367c2c31f51242fb77b350a11830F3')
/// Error: invalid checksum address

// Sign transactions
wallet.sign({
    to: "0x06B5955A67D827CDF91823E3bB8F069e6c89c1D6",
    gasLimit: 3000000,
    gasPrice: "0x1000",
    value: "0x1000"
})

```

Contract API
------------

```javascript
// Load a normal web3 object (you need a local RPC-enabled ethereum node running)
var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))

// Create your wallet
var wallet = new Wallet('0x3141592653589793238462643383279502884197169399375105820974944592')

console.log(wallet.address);
/// "0x7357589f8e367c2C31F51242fB77B350A11830F3"

// Find an existing contract address and ABI
// See: https://gist.github.com/ricmoo/e78709e075ff8082a86c875ac062c3c3
var simpleStorageAddress = '0xdfaf84077cF4bCECA4F79d167F47041Ed3006D5b'
var simpleStorageAbi = [
    {
        "constant":true,
        "inputs":[],
        "name":"getValue",
        "outputs":[{"name":"","type":"string"}],
        "type":"function"
    }, {
        "constant":false,
        "inputs":[{"name":"value","type":"string"}],
        "name":"setValue",
        "outputs":[],
        "type":"function"
    }, {
        "anonymous":false,
        "inputs":[
            {"indexed":false,"name":"oldValue","type":"string"},
            {"indexed":false,"name":"newValue","type":"string"}
        ],
        "name":"valueChanged",
        "type":"event"
    }
];

// Get the contract
var contract = wallet.getContract(web3, simpleStorageAddress, simpleStorageAbi)

// Set up events
contract.onvaluechanged = function(oldValue, newValue) {
    console.log('Value Changed from "' + oldValue + '" to "' + newValue + '".')
}

// Call constant methods, which don't alter state (free).
// Returns a promise.
contract.getValue().then(function(value) {
    console.log('Value is "' + value + '".')
})

// Call state-changing methods (which will cost you ether, so use testnet to test!)
// Returns a promise.
contract.setValue("Hello World").then(function(txid) {
    console.log('txid: ' + txid);
});

// Include ether with a state-changing call, or custom gasLimit or gasPrice
var options = {
    gasPrice: 1000       // in wei (default: from network)
    gasLimit: 3000000,   // is gas (default: 3000000)
    value:    1000       // in wei (default: 0)
}
contract.setValue("Hello World", options).then(function(txid) {
    console.log('txid: ' + txid);
});

```


License
-------

MIT Licensed, with the exceptions:
- The Solidity encoder/decoder (LGPL)
- RLP (MPL-2.0)

We are working on our own implementations so we can move off of them and have a completely MIT licensed implementation in the near future.

Stay tuned! 
