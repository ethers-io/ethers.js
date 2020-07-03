-----

Documentation: [html](https://docs.ethers.io/)

-----

HD Wallet
=========

Types
-----

### Constants

#### *ethers* . *utils* . **defaultPath** => *"m/44'/60'/0'/0/0"*

The default path for Ethereum in an HD Wallet


### Mnemonic

#### *mnemonic* . **phrase** => *string*

The mnemonic phrase for this mnemonic. It is 12, 15, 18, 21 or 24 words long and separated by the whitespace specified by the `locale`.


#### *mnemonic* . **path** => *string*

The HD path for this mnemonic.


#### *mnemonic* . **locale** => *string*

The language of the wordlist this mnemonic is using.


HDNode
------

### Creating Instances

#### *ethers* . *HDNode* . **fromMnemonic**( phrase [ , password [ , wordlist ] ] ) => *[HDNode](/v5/api/utils/hdnode/#HDNode)*

Return the [HDNode](/v5/api/utils/hdnode/#HDNode) for *phrase* with the optional *password* and *wordlist*.


#### *ethers* . *HDNode* . **fromSeed**( aBytesLike ) => *[HDNode](/v5/api/utils/hdnode/#HDNode)*

Return the [HDNode](/v5/api/utils/hdnode/#HDNode) for the seed *aBytesLike*.


#### *ethers* . *HDNode* . **fromExtendedKey**( extendedKey ) => *[HDNode](/v5/api/utils/hdnode/#HDNode)*

Return the [HDNode](/v5/api/utils/hdnode/#HDNode) for the *extendedKey*. If *extendedKey* was neutered, the **HDNode** will only be able to compute addresses and not private keys.


### Properties

#### *hdNode* . **privateKey** => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString)< 32 > >*

The private key for this HDNode.


#### *hdNode* . **publicKey** => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString)< 33 > >*

The (compresses) public key for this HDNode.


#### *hdNode* . **fingerprint** => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString)< 4 > >*

The fingerprint is meant as an index to quickly match parent and children nodes together, however collisions may occur and software should verify matching nodes.

Most developers will not need to use this.


#### *hdNode* . **parentFingerprint** => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString)< 4 > >*

The fingerprint of the parent node. See *fingerprint* for more details.

Most developers will not need to use this.


#### *hdNode* . **address** => *string< [Address](/v5/api/utils/address/#address) >*

The address of this HDNode.


#### *hdNode* . **mnemonic** => *[Mnemonic](/v5/api/utils/hdnode/#Mnemonic)*

The mnemonic of this HDNode, if known.


#### *hdNode* . **path** => *string*

The path of this HDNode, if known. If the *mnemonic* is also known, this will match `mnemonic.path`.


#### *hdNode* . **chainCode** => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString)< 32 > >*

The chain code is used as a non-secret private key which is then used with EC-multiply to provide the ability to derive addresses without the private key of child non-hardened nodes.

Most developers will not need to use this.


#### *hdNode* . **index** => *number*

The index of this HDNode. This will match the last component of the *path*.

Most developers will not need to use this.


#### *hdNode* . **depth** => *number*

The depth of this HDNode. This will match the number of components (less one, the `m/`) of the *path*.

Most developers will not need to use this.


#### *hdNode* . **extendedKey** => *string*

A serialized string representation of this HDNode. Not all properties are included in the serialization, such as the mnemonic and path, so serializing and deserializing (using the `fromExtendedKey` class method) will result in reduced information.


### Methods

#### *hdNode* . **neuter**( ) => *[HDNode](/v5/api/utils/hdnode/#HDNode)*

Return a new instance of *hdNode* with its private key removed but all otehr properties preserved. This ensures that the key can not leak the private key of itself or any derived children, but may still be used to compute the addresses of itself and any non-hardened children.


#### *hdNode* . **derivePath**( path ) => *[HDNode](/v5/api/utils/hdnode/#HDNode)*

Return a new [HDNode](/v5/api/utils/hdnode/#HDNode) which is the child of *hdNode* found by deriving *path*.


Other Functions
---------------

#### *ethers* . *utils* . **mnemonicToSeed**( phrase [ , password ] ) => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString)< 64 > >*

Convert a mnemonic phrase to a seed, according to [BIP-39](https://en.bitcoin.it/wiki/BIP_0039).


#### *ethers* . *utils* . **mnemonicToEntropy**( phrase [ , wordlist ] ) => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString) >*

Convert a mnemonic phrase to its entropy, according to [BIP-39](https://en.bitcoin.it/wiki/BIP_0039).


#### *ethers* . *utils* . **isValidMnemonic**( phrase [ , wordlist ] ) => *boolean*

Returns true if *phrase* is a valid mnemonic phrase, by testing the checksum.


