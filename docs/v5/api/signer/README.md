-----

Documentation: [html](https://docs.ethers.io/)

-----

Signers
=======

Signer
------

#### *signer* . **connect**( provider ) => *[Signer](/v5/api/signer/#Signer)*

Sub-classes **must** implement this, however they may simply throw an error if changing providers is not supported.


#### *signer* . **getAddress**( ) => *Promise< string< [Address](/v5/api/utils/address/#address) > >*

Returns a Promise that resolves to the account address.

This is a Promise so that a **Signer** can be designed around an asynchronous source, such as hardware wallets.

Sub-classes **must** implement this.


#### *Signer* . **isSigner**( object ) => *boolean*

Returns true if an only if *object* is a **Signer**.


### Blockchain Methods

#### *signer* . **getBalance**( [ blockTag = "latest" ] ) => *Promise< [BigNumber](/v5/api/utils/bignumber/) >*

Returns the balance of this wallet at *blockTag*.


#### *signer* . **getChainId**( ) => *Promise< number >*

Returns the chain ID this wallet is connected to.


#### *signer* . **getGasPrice**( ) => *Promise< [BigNumber](/v5/api/utils/bignumber/) >*

Returns the current gas price.


#### *signer* . **getTransactionCount**( [ blockTag = "latest" ] ) => *Promise< number >*

Returns the number of transactions this account has ever sent. This is the value required to be included in transactions as the `nonce`.


#### *signer* . **call**( transactionRequest ) => *Promise< string< [DataHexString](/v5/api/utils/bytes/#DataHexString) > >*

Returns the result of calling using the *transactionRequest*, with this account address being used as the `from` field.


#### *signer* . **estimateGas**( transactionRequest ) => *Promise< [BigNumber](/v5/api/utils/bignumber/) >*

Returns the result of estimating the cost to send the *transactionRequest*, with this account address being used as the `from` field.


#### *signer* . **resolveName**( ensName ) => *Promise< string< [Address](/v5/api/utils/address/#address) > >*

Returns the address associated with the *ensName*.


### Signing

#### *signer* . **signMessage**( message ) => *Promise< string< [RawSignature](/v5/api/utils/bytes/#signature-raw) > >*

This returns a Promise which resolves to the [Raw Signature](/v5/api/utils/bytes/#signature-raw) of *message*.

Sub-classes **must** implement this, however they may throw if signing a message is not supported, such as in a Contract-based Wallet or Meta-Transaction-based Wallet.


#### Note

If *message* is a string, it is **treated as a string** and converted to its representation in UTF8 bytes.

**If and only if** a message is a [Bytes](/v5/api/utils/bytes/#Bytes) will it be treated as binary data.

For example, the string `"0x1234"` is 6 characters long (and in this case 6 bytes long). This is **not** equivalent to the array `[ 0x12, 0x34 ]`, which is 2 bytes long.

A common case is to sign a hash. In this case, if the hash is a string, it **must** be converted to an array first, using the [arrayify](/v5/api/utils/bytes/#utils-arrayify) utility function.





#### *signer* . **signTransaction**( transactionRequest ) => *Promise< string< [DataHexString](/v5/api/utils/bytes/#DataHexString) > >*

Returns a Promise which resolves to the signed transaction of the *transactionRequest*. This method does not populate any missing fields.

Sub-classes **must** implement this, however they may throw if signing a transaction is not supported, which is common for security reasons in many clients.


#### *signer* . **sendTransaction**( transactionRequest ) => *Promise< [TransactionResponse](/v5/api/providers/types/#providers-TransactionResponse) >*

This method populates the transactionRequest with missing fields, using [populateTransaction](/v5/api/signer/#Signer-populateTransaction) and returns a Promise which resolves to the transaction.

Sub-classes **must** implement this, however they may throw if sending a transaction is not supported, such as the [VoidSigner](/v5/api/signer/#VoidSigner) or if the Wallet is offline and not connected to a [Provider](/v5/api/providers/provider/).


#### *signer* . **_signTypedData**( domain , types , value ) => *Promise< string< [RawSignature](/v5/api/utils/bytes/#signature-raw) > >*

Signs the typed data *value* with *types* data structure for *domain* using the [EIP-712](https://eips.ethereum.org/EIPS/eip-712) specification.


#### Experimental feature (this method name will change)

This is still an experimental feature. If using it, please specify the **exact** version of ethers you are using (e.g. spcify `"5.0.18"`, **not** `"^5.0.18"`) as the method name will be renamed from `_signTypedData` to `signTypedData` once it has been used in the field a bit.


```javascript
// All properties on a domain are optional
const domain = {
    name: 'Ether Mail',
    version: '1',
    chainId: 1,
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
};

// The named list of all type definitions
const types = {
    Person: [
        { name: 'name', type: 'string' },
        { name: 'wallet', type: 'address' }
    ],
    Mail: [
        { name: 'from', type: 'Person' },
        { name: 'to', type: 'Person' },
        { name: 'contents', type: 'string' }
    ]
};

// The data to sign
const value = {
    from: {
        name: 'Cow',
        wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826'
    },
    to: {
        name: 'Bob',
        wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB'
    },
    contents: 'Hello, Bob!'
};


const signature = await signer._signTypedData(domain, types, value);
// '0x463b9c9971d1a144507d2e905f4e98becd159139421a4bb8d3c9c2ed04eb401057dd0698d504fd6ca48829a3c8a7a98c1c961eae617096cb54264bbdd082e13d1c'
```

### Sub-Classes

#### *signer* . **checkTransaction**( transactionRequest ) => *[TransactionRequest](/v5/api/providers/types/#providers-TransactionRequest)*

This is generally not required to be overridden, but may be needed to provide custom behaviour in sub-classes.

This should return a **copy** of the *transactionRequest*, with any properties needed by `call`, `estimateGas` and `populateTransaction` (which is used by sendTransaction). It should also throw an error if any unknown key is specified.

The default implementation checks only if valid [TransactionRequest](/v5/api/providers/types/#providers-TransactionRequest) properties exist and adds `from` to the transaction if it does not exist.

If there is a `from` field it **must** be verified to be equal to the Signer's address.


#### *signer* . **populateTransaction**( transactionRequest ) => *Promise< [TransactionRequest](/v5/api/providers/types/#providers-TransactionRequest) >*

This is generally not required to be overridden, but may be needed to provide custom behaviour in sub-classes.

This should return a **copy** of *transactionRequest*, follow the same procedure as `checkTransaction` and fill in any properties required for sending a transaction. The result should have all promises resolved; if needed the [resolveProperties](/v5/api/utils/properties/#utils-resolveproperties) utility function can be used for this.

The default implementation calls `checkTransaction` and resolves to if it is an ENS name, adds `gasPrice`, `nonce`, `gasLimit` and `chainId` based on the related operations on Signer.


Wallet
------

#### **new ***ethers* . **Wallet**( privateKey [ , provider ] )

Create a new Wallet instance for *privateKey* and optionally connected to the *provider*.


#### *ethers* . *Wallet* . **createRandom**( [ options = {} ] ) => *[Wallet](/v5/api/signer/#Wallet)*

Returns a new Wallet with a random private key, generated from cryptographically secure entropy sources. If the current environment does not have a secure entropy source, an error is thrown.

Wallets created using this method will have a mnemonic.


#### *ethers* . *Wallet* . **fromEncryptedJson**( json , password [ , progress ] ) => *Promise< [Wallet](/v5/api/signer/#Wallet) >*

Create an instance from an encrypted JSON wallet.

If *progress* is provided it will be called during decryption with a value between 0 and 1 indicating the progress towards completion.


#### *ethers* . *Wallet* . **fromEncryptedJsonSync**( json , password ) => *[Wallet](/v5/api/signer/#Wallet)*

Create an instance from an encrypted JSON wallet.

This operation will operate synchronously which will lock up the user interface, possibly for a non-trivial duration. Most applications should use the asynchronous `fromEncryptedJson` instead.


#### *ethers* . *Wallet* . **fromMnemonic**( mnemonic [ , path , [ wordlist ] ] ) => *[Wallet](/v5/api/signer/#Wallet)*

Create an instance from a mnemonic phrase.

If path is not specified, the Ethereum default path is used (i.e. `m/44'/60'/0'/0/0`).

If wordlist is not specified, the English Wordlist is used.


### Properties

#### *wallet* . **address** => *string< [Address](/v5/api/utils/address/#address) >*

The address for the account this Wallet represents.


#### *wallet* . **provider** => *[Provider](/v5/api/providers/provider/)*

The provider this wallet is connected to, which will be used for any [Blockchain Methods](/v5/api/signer/#Signer--blockchain-methods) methods. This can be null.


#### Note

A **Wallet** instance is immutable, so if you wish to change the Provider, you may use the [connect](/v5/api/signer/#Signer-connect) method to create a new instance connected to the desired provider.


#### *wallet* . **publicKey** => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString)< 65 > >*

The uncompressed public key for this Wallet represents.


### Methods

#### *wallet* . **encrypt**( password , [ options = {} , [ progress ] ] ) => *Promise< string >*

Encrypt the wallet using *password* returning a Promise which resolves to a JSON wallet.

If *progress* is provided it will be called during decryption with a value between 0 and 1 indicating the progress towards completion.


```javascript
// Create a wallet instance from a mnemonic...
mnemonic = "announce room limb pattern dry unit scale effort smooth jazz weasel alcohol"
walletMnemonic = Wallet.fromMnemonic(mnemonic)

// ...or from a private key
walletPrivateKey = new Wallet(walletMnemonic.privateKey)

walletMnemonic.address === walletPrivateKey.address
// true

// The address as a Promise per the Signer API
walletMnemonic.getAddress()
// { Promise: '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1' }

// A Wallet address is also available synchronously
walletMnemonic.address
// '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1'

// The internal cryptographic components
walletMnemonic.privateKey
// '0x1da6847600b0ee25e9ad9a52abbd786dd2502fa4005dd5af9310b7cc7a3b25db'
walletMnemonic.publicKey
// '0x04b9e72dfd423bcf95b3801ac93f4392be5ff22143f9980eb78b3a860c4843bfd04829ae61cdba4b3b1978ac5fc64f5cc2f4350e35a108a9c9a92a81200a60cd64'

// The wallet mnemonic
walletMnemonic.mnemonic
// {
//   locale: 'en',
//   path: "m/44'/60'/0'/0/0",
//   phrase: 'announce room limb pattern dry unit scale effort smooth jazz weasel alcohol'
// }

// Note: A wallet created with a private key does not
//       have a mnemonic (the derivation prevents it)
walletPrivateKey.mnemonic
// null

// Signing a message
walletMnemonic.signMessage("Hello World")
// { Promise: '0x14280e5885a19f60e536de50097e96e3738c7acae4e9e62d67272d794b8127d31c03d9cd59781d4ee31fb4e1b893bd9b020ec67dfa65cfb51e2bdadbb1de26d91c' }

tx = {
  to: "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
  value: utils.parseEther("1.0")
}

// Signing a transaction
walletMnemonic.signTransaction(tx)
// { Promise: '0xf865808080948ba1f109551bd432803012645ac136ddd64dba72880de0b6b3a7640000801ca0918e294306d177ab7bd664f5e141436563854ebe0a3e523b9690b4922bbb52b8a01181612cec9c431c4257a79b8c9f0c980a2c49bb5a0e6ac52949163eeb565dfc' }

// The connect method returns a new instance of the
// Wallet connected to a provider
wallet = walletMnemonic.connect(provider)

// Querying the network
wallet.getBalance();
// { Promise: { BigNumber: "42" } }
wallet.getTransactionCount();
// { Promise: 0 }

// Sending ether
wallet.sendTransaction(tx)
```

VoidSigner
----------

#### **new ***ethers* . **VoidSigner**( address [ , provider ] ) => *[VoidSigner](/v5/api/signer/#VoidSigner)*

Create a new instance of a **VoidSigner** for *address*.


#### *voidSigner* . **address** => *string< [Address](/v5/api/utils/address/#address) >*

The address of this **VoidSigner**.


```javascript
address = "0x8ba1f109551bD432803012645Ac136ddd64DBA72"
signer = new ethers.VoidSigner(address, provider)

// The DAI token contract
abi = [
  "function balanceOf(address) view returns (uint)",
  "function transfer(address, uint) returns (bool)"
]
contract = new ethers.Contract("dai.tokens.ethers.eth", abi, signer)

// Get the number of tokens for this account
tokens = await contract.balanceOf(signer.getAddress())
// { BigNumber: "198172622063578627973" }

//
// Pre-flight (check for revert) on DAI from the signer
//
// Note: We do not have the private key at this point, this
//       simply allows us to check what would happen if we
//       did. This can be useful to check before prompting
//       a request in the UI
//

// This will pass since the token balance is available
contract.callStatic.transfer("donations.ethers.eth", tokens)
// { Promise: true }

// This will fail since it is greater than the token balance
contract.callStatic.transfer("donations.ethers.eth", tokens.add(1))
// Error: call revert exception (method="transfer(address,uint256)", errorSignature="Error(string)", errorArgs=["Dai/insufficient-balance"], reason="Dai/insufficient-balance", code=CALL_EXCEPTION, version=abi/5.0.12)
```

ExternallyOwnedAccount
----------------------

#### *eoa* . **address** => *string< [Address](/v5/api/utils/address/#address) >*

The [Address](/v5/api/utils/address/#address) of this EOA.


#### *eoa* . **privateKey** => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString)< 32 > >*

The privateKey of this EOA


#### *eoa* . **mnemonic** => *[Mnemonic](/v5/api/utils/hdnode/#Mnemonic)*

*Optional*. The account HD mnemonic, if it has one and can be determined. Some sources do not encode the mnemonic, such as HD extended keys.


