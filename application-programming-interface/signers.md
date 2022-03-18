# Signers

A **Signer** in _hethers_ is an abstraction of a Hedera Account, which can be used to sign messages and transactions and send signed transactions to the Hedera Network to execute state-changing operations.

The available operations depend largely on the sub-class used.

### Signer

The **Signer** class is abstract and cannot be directly instantiated. Instead, use the Wallet.

#### `signer.connect( provider )` ⇒ [Signer](signers.md#signer)

&#x20;   Sub-classes **must** implement this. Returns a new instance of the Signer, connected to the provider.

```typescript
const connectedSigner = signer.connect(provider);
```

#### `signer.getAddress( )` ⇒ Promise< string< [Address](utilities/addresses.md) > >

&#x20;   Returns a Promise that resolves to the account address.

&#x20;   This is a Promise so that a **Signer** can be designed around an asynchronous source, such as hardware wallets.

&#x20;   Sub-classes **must** implement this.

```typescript
await connectedSigner.getAddress();
// '0x0000000000000000000000000000000001C31552'
```

#### `Signer.isSigner( object )` ⇒ boolean

&#x20;   Returns true if and only if _object_ is a [Signer](signers.md#signer).

```typescript
hethers.Signer.isSigner(connectedSigner)
// true
```

#### Methods

#### `signer.getBalance( )` ⇒ Promise< [BigNumber](utilities/bignumber.md) >

&#x20;   Returns the balance of this wallet.

```typescript
await connectedSigner.getBalance();
// BigNumber { _hex: '0x01968b2cb94c', _isBigNumber: true }
```

#### `signer.getChainId( )` ⇒ Promise< number >

&#x20;   Returns the chain ID this wallet is connected to.

```typescript
await connectedSigner.getChainId();
// 291
```

#### `signer.call( transactionRequest )` ⇒ Promise< string< [DataHexString ](utilities/byte-manipulation.md#datahexstring)> >

&#x20;   Returns the result of calling using the _transactionRequest_, with this account address being used as the `from` field. Contrary to other EVM networks, static calls in Hedera are paid, thus executing a `call` method is performed through the `Signer` . The provider interface executes a `ContractLocalCall` query under the hood. This is useful for calling getters on Contracts.

```typescript
await wallet.call({ 
    to: "0x0000000000000000000000000000000001c42505", 
    gasLimit: 50000,
    data: "0x3b3b57debf074faa138b72c65adbdcfb329847e4f2c04bde7f7dd7fcad5a52d2f395a558"
});
// '0x0000000000000000000000005555763613a12d8f3e73be831dff8598089d3dca'
```

#### Signing

#### `signer.signMessage( message )` ⇒ Promise< string< [RawSignature ](utilities/byte-manipulation.md#raw-signature-inherits-datahexstring)> >

&#x20;   This returns a Promise which resolves to the Raw Signature of _message_.

&#x20;   Sub-classes **must** implement this, however they may throw if signing a message is not supported

```typescript
await connectedSigner.signMessage('message');
// 0xb462249048c96518da287131d64330f9530125c8d98e2f90f05f0108c6b74604397a268b3386e6c877d496daba65588e9700af66966762802d0139a7dfae537d1c
```

#### `signer.signTransaction( transactionRequest )` ⇒ Promise< string< [DataHexString ](utilities/byte-manipulation.md#datahexstring)> >

&#x20;   Returns a Promise which resolves to the signed transaction of the _transactionRequest_. This method does not populate any missing fields.

&#x20;   Sub-classes **must** implement this, however they may throw if signing a transaction is not supported, which is common for security reasons in many clients.

```typescript
await connectedSigner.signTransaction(tx);
// 0x0ac1012abe010a530a1a0a0b0888a9fd900610d0b2b11412090800100018d2aa8c0e180012060800100018031880c2d72f22020878320072220a200a0e0a090800100018d2aa8c0e10c7010a0e0a090800100018d2aa8c0e10c80112670a650a210238b02dc2bf190448fd92eccaf6cc1129debc16f0c1b1b83a0a70cb206e1ec7793240ddad8b932de26c7de1eb6b983d6b214281f5523f50a84bf78b93bc52efc3eda68d76a969001322da336ca186857d27a27dec3b0a1647a42d53761702a5a5dadc
```

#### `signer.sendTransaction( transactionRequest )` ⇒ Promise< [TransactionResponse ](providers/types.md#transactionresponse)>

&#x20;   This method populates the transactionRequest with missing fields, using populateTransaction and returns a Promise which resolves to the transaction.

&#x20;   Sub-classes **must** implement this, however they may throw if sending a transaction is not supported or if the Wallet is offline and not connected to a [Provider](providers/provider/).

&#x20;   Signs the transaction with the key given upon creation. Transaction can be:

* `FileCreateTransaction` - when there is only `fileChunk` field in the `transaction.customData` object
* `FileAppendTransaction` - when there is both `fileChunk` and a `fileId` fields
* `ContractCreateTransaction` - when there is a `bytecodeFileId` field
* `ContractExecuteTransaction` - when there is a `to` field present. Ignores the other fields
* `TransferTransaction` - when there is both `to` and a `value` fields
* `AccountCreateTransaction` - when there is a `publicKey` field in the `transaction.customData` object, also `initialBalance` can be provided as optional field in `customData`

```typescript
await connectedSigner.sendTransaction(tx);
// {
//   transactionId: '0.0.29562194-1646220675-432278669',
//   hash: '0xbc677be599074d716fcbc3422faef26d5318bfd00666ce95cd114ca82bdd64a65c71a7641f3a7b35283380fe94d6c12c',
//   from: '0x0000000000000000000000000000000001c31552',
//   chainId: 0,
//   r: '',
//   s: '',
//   v: 0,
//   customData: {},
//   wait: [Function (anonymous)]
// }
```

#### Sub-Classes

It is very important that all important properties of a [Signer](signers.md#signer) are **immutable**. Since Hedera Hashgraph is very asynchronous and deals with critical data, keeping properties such as the _provider_ and _address_ static throughout the life-cycle of the Signer helps prevent serious issues and many other classes and libraries make this assumption.

A sub-class **must** extend Signer and **must** call `super()`.

#### `signer.checkTransaction( transactionRequest )` ⇒ [TransactionRequest](providers/types.md#transactionrequest)

&#x20;   This is generally not required to be overridden, but may be needed to provide custom behaviour in sub-classes.

&#x20;   This should return a **copy** of the _transactionRequest_, with any properties needed by `call` and `populateTransaction` (which is used by sendTransaction). It should also throw an error if any unknown key is specified.

&#x20;   The default implementation checks only if valid TransactionRequest properties exist and adds `from` to the transaction if it does not exist.

&#x20;   If there is a `from` field it **must** be verified to be equal to the Signer's address.

```typescript
await connectedSigner.checkTransaction(tx);
// {
//   to: '0.0.29631750',
//   value: 100,
//   gasLimit: 50000,
//   nodeId: '0.0.7',
//   from: Promise { '0x0000000000000000000000000000000001C31552' }
// }
```

#### `signer.populateTransaction( transactionRequest )` ⇒ Promise< [TransactionRequest ](providers/types.md#transactionrequest)>

&#x20;   This is generally not required to be overridden, but may be needed to provide custom behaviour in sub-classes.

&#x20;   This should return a **copy** of _transactionRequest_, follow the same procedure as `checkTransaction` and fill in any properties required for sending a transaction. The result should have all promises resolved; if needed the resolveProperties utility function can be used for this.

&#x20;   The default implementation calls `checkTransaction` and resolves `to`, adds `customData` based on the related operations on Signer.

```typescript
await connectedSigner.populateTransaction(tx);
// {
//   to: '0x0000000000000000000000000000000001C42506',
//   value: 100,
//   nodeId: '0.0.6',
//   from: '0x0000000000000000000000000000000001C31552',
//   gasLimit: undefined,
//   customData: { isCryptoTransfer: true }
// }
```

### Wallet

The Wallet class inherits [Signer](signers.md#signer) and can sign transactions and messages using a private key and account ID as a standard Externally Owned Account ([EOA](signers.md#externallyownedaccount)).

#### `new hethers.Wallet( privateKey [ , provider ] )`⇒ [Wallet](signers.md#wallet)

&#x20;   Create a new Wallet instance for _privateKey_ and optionally connected to the _provider_.\
\
&#x20;   Note: Using only a private Key for wallet initialization is not enough for further transaction execution in Hedera Network. Connecting to an account is mandatory for a fully operational wallet.

```typescript
const privateKey = '0x3b6cd41ded6486add931390d4d3efa0bb2b311a8415cfe61716cac0234de035d';

const wallet = new hethers.Wallet(privateKey, provider);
```

#### `new hethers.Wallet(`[`< ExternallyOwnedAccount >`](signers.md#externallyownedaccount)`[ , provider ] )`

&#x20;   Create a new Wallet instance for [ExternallyOwnedAccount](signers.md#externallyownedaccount) and optionally connected to the provider. \
\
&#x20;   Note: That wallet is fully operational, and can sign or send transactions, if _accountId or address_ and _privateKey_ are set up in the `ExternallyOwnedAccount` object.

```typescript
// Initialize wallet using address and private key
const eoaAddress = {
    address: "0x0000000000000000000000000000000000000001",
    privateKey: "0x074cc0bd188d1bc91f668c59b46a1e74fd13215661e5a7bd42ad0d324476295d"
};
const walletEoaAddress = new hethers.Wallet(eoaAddress, provider);

// Initialize wallet using hedera's account id and private key
const eoaAccount = {
    account: "0.0.2",
    privateKey: "0x074cc0bd148d1bc91f668c59b46a1e74fd13215661e5a7bd42ad0d324476295d"
};
const walletEoaAccount = new hethers.Wallet(eoaAccount, provider);

// Initialize wallet using alias and private key
const eoaAlias = {
    alias: "0.0.BMAiA3xjpm4sULCFp5YuREmQDwJ7bbjrvFhi/ZnWaFNrRFGTh330h4aPqg8zZkJh7qzVjaNOWy1qpdt8bRbDFlc=",
    privateKey: "0xc59f86eef4511f27450d3baf2139ae535061c4743a7f02a6e89fed014d551b4a"
}
const walletEoaAlias = new hethers.Wallet(eoaAlias, provider);
```

#### `hethers.Wallet.createRandom( [ options = {} ] )` ⇒ [Wallet](signers.md#wallet)

&#x20;   Returns a new Wallet with a random private key, generated from cryptographically secure entropy sources. If the current environment does not have a secure entropy source, an error is thrown. The library supports [HIP-32](https://hips.hedera.com/hip/hip-32), thus the created wallet will have an alias populated. In order for the wallet to be fully functional (be able to send transactions), it must be created by sending hbars to the alias for example.

```typescript
const randomWallet = hethers.Wallet.createRandom();
randomWallet.privateKey
// '0x0bcdfa8acd4947d957a4b4ef4916a22bd8b34a82a3e238b554eb9c079dda1678'
```

#### `hethers.Wallet.fromEncryptedJson( json , password [ , progress ] )` ⇒ Promise< [Wallet](signers.md#wallet) >

&#x20;   Create an instance by decrypting an encrypted JSON wallet.

&#x20;   If _progress_ is provided it will be called during decryption with a value between 0 and 1 indicating the progress towards completion.

```typescript
const encryptedJson = await wallet.encrypt("secret");

const decryptedWallet = await hethers.Wallet.fromEncryptedJson(encryptedJson, "secret");
```

#### `hethers.Wallet.fromEncryptedJsonSync( json , password )` ⇒ [Wallet](signers.md#wallet)

&#x20;   Create an instance from an encrypted JSON wallet.

&#x20;   This operation will operate synchronously which will lock up the user interface, possibly for a non-trivial duration. Most applications should use the asynchronous `fromEncryptedJson` instead.

```typescript
const encryptedJson = await wallet.encrypt("secret");

const decryptedWallet = hethers.Wallet.fromEncryptedJsonSync(encryptedJson, "secret");
```

#### `hethers.Wallet.fromMnemonic( mnemonic [ , path , [ wordlist ] ] )` ⇒ [Wallet](signers.md#wallet)

&#x20;   Create an instance from a mnemonic phrase.

```typescript
const mnemonic = "bullet network horse dash ahead kick donkey require blame ability punch surprise";

const mnemonicWallet = hethers.Wallet.fromMnemonic(mnemonic);
```

#### Properties

#### `wallet.address` ⇒ string< [Address](utilities/addresses.md) >

&#x20;   The address for the account this Wallet represents.

```typescript
walletPkey.address;
// '0x0000000000000000000000000000000001c42505'
```

#### `wallet.provider` ⇒ [Provider](providers/provider/)

&#x20;   The provider this wallet is connected to, which will be used for any [Methods](signers.md#methods). This can be null.

&#x20;   A **Wallet** instance is immutable, so if you wish to change the Provider, you may use the `connect` method to create a new instance connected to the desired provider.

#### `wallet.publicKey` ⇒ string< [DataHexString ](utilities/byte-manipulation.md#datahexstring)>

&#x20;   The uncompressed public key for this Wallet represents.

```
walletPkey.publicKey;
// '0x0438b02dc2bf190448fd92eccaf6cc1129debc16f0c1b1b83a0a70cb206e1ec7796ff1da61d00e30f43b461b880ced6f177a8b802f401a5e3b972bb48f25adf0b8'
```

#### Methods

#### `wallet.connectAccount( < AccountLike > )` ⇒ [Wallet](signers.md#wallet)

&#x20;   Return a new instance of a fully operational wallet, that can be used for transaction signing and sending.

```typescript
// Initialize the wallet
const privateKey = '0xc59f86eef3511f27450d3baf2139ae535061c4743a7f02a6e89fed014d551b4a';
const wallet = new hethers.Wallet(privateKey, provider);

// Connect to an account via hedera's account id
const connectedViaAccountId = wallet.connectAccount('0.0.1');

// Connect to an account via address
const connectedViaAddress = wallet.connectAccount('0x0000000000000000000000000000000000000001');

// Connect to an account via Account Type
const connectedViaAccount = wallet.connectAccount({
    shard: BigInt(0), 
    realm: BigInt(0), 
    num: BigInt(1) 
});
```

#### `wallet.connect( provider )` ⇒ [Wallet](signers.md#wallet)

&#x20;   Return a new instance, connected to the provider.

```typescript
const connectedWallet = wallet.connect(provider);
```

#### `wallet.createAccount( publicKey , [ initialBalance: BigInt ])` ⇒ < [TransactionResponse ](providers/types.md#transactionresponse)>

&#x20;   The transaction receipt containts the ID of the newly created account in the `TransactionReceipt.accountAddress` field.

&#x20;   Note: There are two ways you can create an account either by using an existing account or by using an alias. If you have an existing account, you can use that account to create a new account and to pay for the associated transaction fees in hbar. If you do not have access to an existing account, you can create a testnet account via the [Hedera Developer Portal](https://portal.hedera.com/register) or a mainnet account through one of the options listed [here](https://docs.hedera.com/guides/mainnet/mainnet-access).

```typescript
// create an account
const pubKey = randomAccount._signingKey().compressedPublicKey;
const txResponse = await wallet.createAccount(pubKey, BigInt(1));
const result = await txResponse.wait();

// once the account is created, it needs to be connected to provider 
newAccount = new hethers.Wallet(result.accountAddress, provider);
await newAccount.getAddress()
```

#### `wallet.getAddress()` ⇒ Promise< string >

&#x20;    The address for the account this Wallet represents.

```typescript
await wallet.getAddress();
// '0x0000000000000000000000000000000001c42505'
```

#### `wallet.encrypt( password , [ options = {} , [ progress ] ] )` ⇒ Promise< string >

&#x20;   Encrypt the wallet using _password_ returning a Promise which resolves to a JSON wallet.

&#x20;   If _progress_ is provided it will be called during decryption with a value between 0 and 1 indicating the progress towards completion.

```typescript
const encryptedJson = await wallet.encrypt("secret");
```

#### `wallet.`signMessage`( <`[`TransactionRequest` ](providers/types.md#transactionrequest)`> )` ⇒ Promise< string >

```typescript
await wallet.signMessage('message');
// '0xe1c58c8ea54a270eb99c14e1e6f7bbb14f2a16225556e5e7cc27e77d0f57cad4611fd46c747430e6b9df9cd51fa8430c993f664789034525629742f3ebb0be6d1c'
```

#### `wallet.signTransaction( <`[`TransactionRequest`](providers/types.md#transactionrequest)`> )` ⇒ Promise< string >

```typescript
await wallet.signTransaction({
    to: '0x0000000000000000000000000000000001c42506', 
    value: 1
});
// '0x0ac0012abd010a520a1b0a0c0898f1bd900610fe9ea5ad021209080010001885ca900e180012060800100018071880c2d72f22020878320072200a1e0a0d0a09080010001885ca900e10010a0d0a09080010001885ca900e100212670a650a21031477154d6d1be6a6d899f295c049a94f227f97299ac7853e4dbc41a1763fdada3240a16cce5413d6d3394680f7715eace55f5b19938e7fbaff0646456a614c6d5639262ac5a43bce51c062150e6c940aa299027903130de38810bcff39a5cdaba147'
```

#### `wallet.sendTransaction( <`[`TransactionRequest`](providers/types.md#transactionrequest)`> )` ⇒ Promise<[TransactionResponse](providers/types.md#transactionresponse)>

```typescript
await wallet.sendTransaction({
    to: '0x0000000000000000000000000000000001c42506', 
    value: 1
});
// {
//   transactionId: '0.0.29631749-1645182496-340392577',
//   hash: '0x163e2457656ed52b79d0320c9852615b7f5d4032187cb6ba38244000d7634ccf171340ea53c1719e89de40f8d6eff76b',
//   from: '0x0000000000000000000000000000000001c42505',
//   chainId: 0,
//   r: '',
//   s: '',
//   v: 0,
//   customData: {},
//   wait: [Function (anonymous)]
// }
```

### ExternallyOwnedAccount

This is an interface that contains a minimal set of properties required for Externally Owned Accounts(EOA) which can have certain operations performed, such as encoding as a JSON wallet.

#### `eoa.address` ⇒ string< [Address](utilities/addresses.md) >

&#x20;   The [Address](utilities/addresses.md) of this EOA.

#### `eoa.privateKey` ⇒ string< [DataHexString](utilities/byte-manipulation.md#datahexstring)< 32 > >

&#x20;   The privateKey of this EOA.

#### `eoa.account` ⇒ string< [Account ](utilities/accounts.md#data-types)>

&#x20;   The account Id of the EOA.

#### `eoa.alias` => string< [DataHexString](utilities/byte-manipulation.md#datahexstring)< 32 > >

&#x20;   __   &#x20;
