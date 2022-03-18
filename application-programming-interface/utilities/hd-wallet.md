# HD Wallet

The Hierarchal Desterministic (HD) Wallet was a standard created for Bitcoin, but lends itself well to a wide variety of Blockchains which rely on secp256k1 private keys.

For a more detailed technical understanding:

* [BIP-32](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki) - the hierarchal deterministic description
* [BIP-39](https://en.bitcoin.it/wiki/BIP\_0039) - the method used to derive the BIP-32 seed from human-readable sequences of words (i.e. a mnemonic)
* [BIP-44](https://en.bitcoin.it/wiki/BIP\_0044) - a standard defined to make BIP-32 easy to adapt to any future compatible blockchain

## Types

### Constants

#### `hethers.utils.defaultPath ⇒ "m/44'/60'/0'/0/0"`

The default path for Hedera in an HD Wallet

### Mnemonic

#### `mnemonic.phrase ⇒ string`

The mnemonic phrase for this mnemonic. It is 12, 15, 18, 21 or 24 words long and separated by the `whitespace` specified by the `locale`.



#### `mnemonic.path ⇒ string`

The HD path for this mnemonic.



#### `mnemonic.locale ⇒ string`

The language of the `wordlist` this mnemonic is using.

## HDNode

### Creating Instances

#### `hethers.utils.HDNode.fromMnemonic( phrase [, password [, wordlist ] ] ) ⇒ HDNode`

Return the **`HDNode`** for _phrase_ with the optional _password_ and _`wordlist`_.



#### `hethers.utils.HDNode.fromSeed( aBytesLike ) ⇒ HDNode`

Return the **`HDNode`** for the seed _aBytesLike_.



#### `hethers.utils.HDNode.fromExtendedKey( extendedKey ) ⇒ HDNode`

Return the **`HDNode`** for the _extendedKey_. If _extendedKey_ was neutered, the **`HDNode`** will only be able to compute addresses and not private keys.

### Properties

#### `hdNode.privateKey ⇒ string<`[`DataHexString`](byte-manipulation.md#datahexstring)`<32>>`

The private key for this **`HDNode`**.



#### `hdNode.publicKey ⇒ string<`[`DataHexString`](byte-manipulation.md#datahexstring)`<33>>`

The (compresses) public key for this **`HDNode`**.



#### `hdNode.fingerprint ⇒ string<`[`DataHexString`](byte-manipulation.md#datahexstring)`<4>>`

The fingerprint is meant as an index to quickly match parent and children nodes together, however collisions may occur and software should verify matching nodes.

Most developers will not need to use this.



#### `hdNode.parentFingerprint ⇒ string<`[`DataHexString`](byte-manipulation.md#datahexstring)`<4>>`

The fingerprint of the parent node. See _fingerprint_ for more details.

Most developers will not need to use this.

#### `hdNode.address ⇒ string<`[`Address`](addresses.md#address)`>`

The address of this **`HDNode`**.



#### `hdNode.mnemonic ⇒` [`Mnemonic`](hd-wallet.md#mnemonic)``

The mnemonic of this **`HDNode`**, if known.



#### `hdNode.path ⇒ string`

The path of this **`HDNode`**, if known. If the _mnemonic_ is also known, this will match `mnemonic.path`.



#### `hdNode.chainCode ⇒ string<`[`DataHexString`](byte-manipulation.md#datahexstring)`<32>>`

The chain code is used as a non-secret private key which is then used with EC-multiply to provide the ability to derive addresses without the private key of child non-hardened nodes.

Most developers will not need to use this.



#### `hdNode.index ⇒ number`

The index of this **`HDNode`**. This will match the last component of the _path_.

Most developers will not need to use this.



#### `hdNode.depth ⇒ number`

The depth of this **`HDNode`**. This will match the number of components (less one, the `m/`) of the _path_.

Most developers will not need to use this.



#### `hdNode.extendedKey ⇒ string`

A serialized string representation of this **`HDNode`**. Not all properties are included in the serialization, such as the mnemonic and path, so serializing and deserializing (using the `fromExtendedKey` class method) will result in reduced information.

### Methods

#### `hdNode.neuter( ) ⇒` [`HDNode`](hd-wallet.md#hdnode)``

Return a new instance of _hdNode_ with its private key removed but all other properties preserved. This ensures that the key can not leak the private key of itself or any derived children, but may still be used to compute the addresses of itself and any non-hardened children.

#### `hdNode.derivePath( path ) ⇒` [`HDNode`](hd-wallet.md#hdnode)``

Return a new [`HDNode`](hd-wallet.md#hdnode) which is the child of _hdNode_ found by deriving _path_.

### Other Functions

#### `hethers.utils.mnemonicToSeed( phrase [, password ] ) ⇒ string<`[`DataHexString`](byte-manipulation.md#datahexstring)`<64>>`

Convert a mnemonic phrase to a seed, according to BIP-39.



#### `hethers.utils.mnemonicToEntropy( phrase [, wordlist ] ) ⇒ string<`[`DataHexString`](byte-manipulation.md#datahexstring)`>`

Convert a mnemonic phrase to its entropy, according to BIP-39.



#### `hethers.utils.isValidMnemonic( phrase [, wordlist ] ) ⇒ boolean`

Returns true if _phrase_ is a valid mnemonic phrase, by testing the checksum.
