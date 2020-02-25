-----

Documentation: [html](https://docs-beta.ethers.io/)

-----

Signers
=======


A Signer represents...


Signer
------


The **Signer** class is abstract and cannot be directly instaniated. Instead
use one of the concreate sub-classes, such as the [Wallet](./), [VoidSigner](./)
or [JsonRpcSigner](../providers/jsonrpc-provider).


#### *signer* . **connect** ( provider )  **=>** *[Signer](./)*

Sub-classes **must** implement this, however they may simply throw an error
if changing providers is not supported.




#### *signer* . **getAddress** (  )  **=>** *Promise< string< [Address](../utils/address) > >*

Returns a Promise that resolves to the account address.

This is a Promise so that a **Signer** can be designed around an
asynchronous source, such as  hardware wallets.

Sub-classes **must** implement this.




#### *Signer* . **isSigner** ( object )  **=>** *boolean*

Returns true if an only if *object* is a **Signer**.




### Blockchain Methods



#### *signer* . **getBalance** (  [ blockTag="latest" ]  )  **=>** *Promise< [BigNumber](../utils/bignumber) >*

Returns the balance of this wallet at *blockTag*.




#### *signer* . **getChainId** (  )  **=>** *Promise< number >*

Returns ths chain ID this wallet is connected to.




#### *signer* . **getGasPrice** (  )  **=>** *Promise< [BigNumber](../utils/bignumber) >*

Returns the current gas price.




#### *signer* . **getTransactionCount** (  [ blockTag="latest" ]  )  **=>** *Promise< number >*

Returns the number of transactions this account has ever sent. This
is the value required to be included in transactions as the `nonce`.




#### *signer* . **call** ( transactionRequest )  **=>** *Promise< string< [DataHexstring](../utils/bytes) > >*

Returns the result of calling using the *transactionRequest*, with this
account address being used as the `from` field.




#### *signer* . **estimateGas** ( transactionRequest )  **=>** *Promise< [BigNumber](../utils/bignumber) >*

Returns the result of estimating the cost to send the *transactionRequest*,
with this account address being used as the `from` field.




#### *signer* . **resolveName** ( ensName )  **=>** *Promise< string< [Address](../utils/address) > >*

Returns the address associated with the *ensName*.




### Signing



#### *signer* . **signMessage** ( message )  **=>** *Promise< string< [FlatSignature](../utils/bytes) > >*

This returns a Promise which resolves to the [Flat-Format Signature](../utils/bytes)
of *message*.

Sub-classes **must** implement this, however they may throw if signing a
message is not supported.




#### Note

If *message* is a string, it is **treated as a string** and
converted to its representation in UTF8 bytes.

**If and only if** a message is a [Bytes](../utils/bytes) will it be treated as
binary data.

For example, the string `"0x1234"` is 6 characters long (and in
this case 6 bytes long). This is **not** equivalent to the array
`[ 0x12, 0x34 ]`, which is 2 bytes long.

A common case is to sign a hash. In this case, if the hash is a
string, it **must** be converted to an array first, using the
[arrayify](../utils/bytes) utility function.





#### *signer* . **signTransaction** ( transactionRequest )  **=>** *Promise< string< [DataHexstring](../utils/bytes) > >*

Returns a Promise which resolves to the signed transaction of the
*transactionRequest*. This method does not populate any missing fields.

Sub-classes **must** implement this, however they may throw if signing a
transaction is not supported.




#### *signer* . **sendTransaction** ( transactionRequest )  **=>** *Promise< [TransactionResponse](../providers/types) >*

This method populates the transactionRequest with missing fields, using
[populateTransaction](./) and returns a Promise which resolves to the transaction.

Sub-classes **must** implement this, however they may throw if signing a
transaction is not supported.




### Sub-Classes


It is very important that all important properties of a **Signer** are
**immutable**. Since Ethereum is very asynchronous and deals with critical
data (such as ether and other potentially valuable crypto assets), keeping
properties such as the *provider* and *address* static helps prevent
serious issues.

A sub-class **must** call `super()`.


#### *signer* . **checkTransaction** ( transactionRequest )  **=>** *[TransactionRequest](../providers/types)*

This is generally not required to be overridden, but may needed to provide
custom behaviour in sub-classes.

This should return a **copy** of the *transactionRequest*, with any properties
needed by `call`, `estimateGas` and `populateTransaction` (which is used
by sendTransaction). It should also throw an error if any unknown key is specified.

The default implementation checks only valid [TransactionRequest](../providers/types) properties
exist and adds `from` to the transaction if it does not exist, or verifies it is equal
to the Signer's address if it does exist.




#### *signer* . **populateTransaction** ( transactionRequest )  **=>** *Promise< [TransactionRequest](../providers/types) >*

This is generally not required to be overridden, but may needed to provide
custom behaviour in sub-classes.

This should return a **copy** of *transactionRequest*, follow the same procedure
as `checkTransaction` and fill in any properties required for sending a transaction.
The result should have all promises resolved; if needed the [resolveProperties](../utils/properties)
utility function can be used for this.

The default implementation calls `checkTransaction` and resolves to if it is an
ENS name, adds `gasPrice`, `nonce`, `gasLimit` and `chainId` based on the
related operations on Signer.




Wallet
------


The Wallet class inherits [Signer](./) and can sign transactions and messages
using a private key as a standard Externally Owned Account (EOA).


#### **new** *ethers* . **Wallet** ( privateKey [  , provider ]  ) 

Create a new Wallet instance for *privateKey* and optionally
connected to the *provider*.




#### *ethers* . *Wallet* . **createRandom** (  [ options={} ]  )  **=>** *[Wallet](./)*

Returns a new Wallet with a random private key, generated from
cryptographically secure entropy sources. If the current environment
does not have a secure entropy source, an error is thrown.




#### *ethers* . *Wallet* . **fromEncryptedJson** ( json , password [  , progress ]  )  **=>** *Promise< [Wallet](./) >*

Create an instance from an encrypted JSON wallet. If *progress*
is provided it will be called during decryption with a value between 0 and
1 indicating the progress towards completion.




#### *ethers* . *Wallet* . **fromMnemonic** ( mnemonic [  , path ,  [ wordlist ]  ]  )  **=>** *[Wallet](./)*

Create an instance from a mnemonic phrase.

If path is not specified, the Ethereum default path is used (i.e. m/44'/60'/0'/0/0).

If wordlist is not specified, the English Wordlist is used.




### Properties



#### *wallet* . **address** **=>** *string< [Address](../utils/address) >*

The address for the account this Wallet represents.




#### *wallet* . **provider** **=>** *[Provider](../providers/provider)*

The provider this wallet is connected to, which will ge used for any [Blockchain Methods](./)
methods. This can be null.




#### Note

A **Wallet** instance is immuatable, so if you wish to change the Provider, you
may use the [connect](./) method to create a new instance connected
to the desired provider.




#### *wallet* . **publicKey** **=>** *string< [DataHexstring](../utils/bytes)< 65 > >*

The uncompressed public key for this Wallet represents.




### Methods



#### *wallet* . **encrypt** ( password ,  [ options={} ,  [ progress ]  ]  )  **=>** *Promise< string >*

Encrypt the wallet using *password* returning a Promise which resolves
to a JSON wallet.




VoidSigner
----------


A **VoidSigner** is a simple Signer which cannot sign.

It is useful as a read-only signer, when an API requires a
Signer as a parameter, but it is known only read-only operations
will be carried.

For example, the `call` operation will automatically have the
provided address passed along during the execution.


#### **new** *ethers* . **VoidSigner** ( address )  **=>** *[VoidSigner](./)*

Create a new instance of a **VoidSigner** for *address*.




#### *voidSigner* . **address** **=>** *string< [Address](../utils/address) >*

The address of this **VoidSigner**.




ExternallyOwnedAccount
----------------------


This is an interface which contains a minimal set of properties
required for Externally Owned Accounts which can have certain
operations performed, such as encoding as a JSON wallet.


#### *eoa* . **address** **=>** *string< [Address](../utils/address) >*

The [Address](../utils/address) of this EOA.




#### *eoa* . **privateKey** **=>** *string< [DataHexstring](../utils/bytes)< 32 > >*

The privateKey of this EOA




#### *eoa* . **mnemonic** **=>** *[Mnemonic](../utils/hdnode)*

*Optional*. The account HD mnemonic, if it has one and can be
determined. Some sources do not encode the mnemonic, such as an
HD extended keys.





-----
**Content Hash:** 142e4d9da1f8b8a900a2e97de899649447054c6addb8cba0fb3342ff02d29fd8