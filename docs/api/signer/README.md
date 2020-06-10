-----

Documentation: [html](https://docs-beta.ethers.io/)

-----

Signers
=======

Signer
------

#### *signer* . **connect**( provider ) => *[Signer](/api/signer/#Signer)*

Sub-classes **must** implement this, however they may simply throw an error if changing providers is not supported.


#### *signer* . **getAddress**( ) => *Promise< string< [Address](/api/utils/address/#address) > >*

Returns a Promise that resolves to the account address.

This is a Promise so that a **Signer** can be designed around an asynchronous source, such as hardware wallets.

Sub-classes **must** implement this.


#### *Signer* . **isSigner**( object ) => *boolean*

Returns true if an only if *object* is a **Signer**.


### Blockchain Methods

#### *signer* . **getBalance**( [ blockTag = "latest" ] ) => *Promise< [BigNumber](/api/utils/bignumber/) >*

Returns the balance of this wallet at *blockTag*.


#### *signer* . **getChainId**( ) => *Promise< number >*

Returns ths chain ID this wallet is connected to.


#### *signer* . **getGasPrice**( ) => *Promise< [BigNumber](/api/utils/bignumber/) >*

Returns the current gas price.


#### *signer* . **getTransactionCount**( [ blockTag = "latest" ] ) => *Promise< number >*

Returns the number of transactions this account has ever sent. This is the value required to be included in transactions as the `nonce`.


#### *signer* . **call**( transactionRequest ) => *Promise< string< [DataHexString](/api/utils/bytes/#DataHexString) > >*

Returns the result of calling using the *transactionRequest*, with this account address being used as the `from` field.


#### *signer* . **estimateGas**( transactionRequest ) => *Promise< [BigNumber](/api/utils/bignumber/) >*

Returns the result of estimating the cost to send the *transactionRequest*, with this account address being used as the `from` field.


#### *signer* . **resolveName**( ensName ) => *Promise< string< [Address](/api/utils/address/#address) > >*

Returns the address associated with the *ensName*.


### Signing

#### *signer* . **signMessage**( message ) => *Promise< string< [RawSignature](/api/utils/bytes/#signature-raw) > >*

This returns a Promise which resolves to the [Raw Signature](/api/utils/bytes/#signature-raw) of *message*.

Sub-classes **must** implement this, however they may throw if signing a message is not supported, such as in a Contract-based Wallet or Meta-Transaction-based Wallet.


#### Note

If *message* is a string, it is **treated as a string** and converted to its representation in UTF8 bytes.

**If and only if** a message is a [Bytes](/api/utils/bytes/#Bytes) will it be treated as binary data.

For example, the string `"0x1234"` is 6 characters long (and in this case 6 bytes long). This is **not** equivalent to the array `[ 0x12, 0x34 ]`, which is 2 bytes long.

A common case is to sign a hash. In this case, if the hash is a string, it **must** be converted to an array first, using the [arrayify](/api/utils/bytes/#utils-arrayify) utility function.





#### *signer* . **signTransaction**( transactionRequest ) => *Promise< string< [DataHexString](/api/utils/bytes/#DataHexString) > >*

Returns a Promise which resolves to the signed transaction of the *transactionRequest*. This method does not populate any missing fields.

Sub-classes **must** implement this, however they may throw if signing a transaction is not supported, which is common for security reasons in many clients.


#### *signer* . **sendTransaction**( transactionRequest ) => *Promise< [TransactionResponse](/api/providers/types/#providers-TransactionResponse) >*

This method populates the transactionRequest with missing fields, using [populateTransaction](/api/signer/#Signer-populateTransaction) and returns a Promise which resolves to the transaction.

Sub-classes **must** implement this, however they may throw if sending a transaction is not supported, such as the [VoidSigner](/api/signer/#VoidSigner) or if the Wallet is offline and not connected to a [Provider](/api/providers/provider/).


### Sub-Classes

#### *signer* . **checkTransaction**( transactionRequest ) => *[TransactionRequest](/api/providers/types/#providers-TransactionRequest)*

This is generally not required to be overridden, but may needed to provide custom behaviour in sub-classes.

This should return a **copy** of the *transactionRequest*, with any properties needed by `call`, `estimateGas` and `populateTransaction` (which is used by sendTransaction). It should also throw an error if any unknown key is specified.

The default implementation checks only valid [TransactionRequest](/api/providers/types/#providers-TransactionRequest) properties exist and adds `from` to the transaction if it does not exist.

If there is a `from` field it **must** be verified to be equal to the Signer's address.


#### *signer* . **populateTransaction**( transactionRequest ) => *Promise< [TransactionRequest](/api/providers/types/#providers-TransactionRequest) >*

This is generally not required to be overridden, but may needed to provide custom behaviour in sub-classes.

This should return a **copy** of *transactionRequest*, follow the same procedure as `checkTransaction` and fill in any properties required for sending a transaction. The result should have all promises resolved; if needed the [resolveProperties](/api/utils/properties/#utils-resolveproperties) utility function can be used for this.

The default implementation calls `checkTransaction` and resolves to if it is an ENS name, adds `gasPrice`, `nonce`, `gasLimit` and `chainId` based on the related operations on Signer.


Wallet
------

#### **new ***ethers* . **Wallet**( privateKey [ , provider ] )

Create a new Wallet instance for *privateKey* and optionally connected to the *provider*.


#### *ethers* . *Wallet* . **createRandom**( [ options = {} ] ) => *[Wallet](/api/signer/#Wallet)*

Returns a new Wallet with a random private key, generated from cryptographically secure entropy sources. If the current environment does not have a secure entropy source, an error is thrown.

Wallets created using this method will have a mnemonic.


#### *ethers* . *Wallet* . **fromEncryptedJson**( json , password [ , progress ] ) => *Promise< [Wallet](/api/signer/#Wallet) >*

Create an instance from an encrypted JSON wallet.

If *progress* is provided it will be called during decryption with a value between 0 and 1 indicating the progress towards completion.


#### *ethers* . *Wallet* . **fromEncryptedJsonSync**( json , password ) => *[Wallet](/api/signer/#Wallet)*

Create an instance from an encrypted JSON wallet.

This operation will operate synchronously which will lock up the user interface, possibly for a non-trivial duration. Most applications should use the asynchronous `fromEncryptedJson` instead.


#### *ethers* . *Wallet* . **fromMnemonic**( mnemonic [ , path , [ wordlist ] ] ) => *[Wallet](/api/signer/#Wallet)*

Create an instance from a mnemonic phrase.

If path is not specified, the Ethereum default path is used (i.e. `m/44'/60'/0'/0/0`).

If wordlist is not specified, the English Wordlist is used.


### Properties

#### *wallet* . **address** => *string< [Address](/api/utils/address/#address) >*

The address for the account this Wallet represents.


#### *wallet* . **provider** => *[Provider](/api/providers/provider/)*

The provider this wallet is connected to, which will ge used for any [Blockchain Methods](/api/signer/#Signer--blockchain-methods) methods. This can be null.


#### Note

A **Wallet** instance is immuatable, so if you wish to change the Provider, you may use the [connect](/api/signer/#Signer-connect) method to create a new instance connected to the desired provider.


#### *wallet* . **publicKey** => *string< [DataHexString](/api/utils/bytes/#DataHexString)< 65 > >*

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
//!

// The address as a Promise per the Signer API
walletMnemonic.getAddress()
//!

// A Wallet address is also available synchronously
walletMnemonic.address
//!

// The internal cryptographic components
walletMnemonic.privateKey
//!
walletMnemonic.publicKey
//!

// The wallet mnemonic
walletMnemonic.mnemonic
//!

// Note: A wallet created with a private key does not
//       have a mnemonic (the derivation prevents it)
walletPrivateKey.mnemonic
//!

// Signing a message
walletMnemonic.signMessage("Hello World")
//!

tx = {
  to: "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
  value: utils.parseEther("1.0")
}

// Signing a transaction
walletMnemonic.signTransaction(tx)
//!

// The connect method returns a new instance of the
// Wallet connected to a provider
wallet = walletMnemonic.connect(provider)

// Querying the network
wallet.getBalance();
//!
wallet.getTransactionCount();
//!

// Sending ether
wallet.sendTransaction(tx)
// <hide>
//! error
// </hide>
```

VoidSigner
----------

#### **new ***ethers* . **VoidSigner**( address [ , provider ] ) => *[VoidSigner](/api/signer/#VoidSigner)*

Create a new instance of a **VoidSigner** for *address*.


#### *voidSigner* . **address** => *string< [Address](/api/utils/address/#address) >*

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

// <hide>
//!
// </hide>
// Get the number of tokens for this account
tokens = await contract.balanceOf(signer.getAddress())
//! async tokens

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
//!

// This will fail since it is greater than the token balance
contract.callStatic.transfer("donations.ethers.eth", tokens.add(1))
//! error
```

ExternallyOwnedAccount
----------------------

#### *eoa* . **address** => *string< [Address](/api/utils/address/#address) >*

The [Address](/api/utils/address/#address) of this EOA.


#### *eoa* . **privateKey** => *string< [DataHexString](/api/utils/bytes/#DataHexString)< 32 > >*

The privateKey of this EOA


#### *eoa* . **mnemonic** => *[Mnemonic](/api/utils/hdnode/#Mnemonic)*

*Optional*. The account HD mnemonic, if it has one and can be determined. Some sources do not encode the mnemonic, such as an HD extended keys.


