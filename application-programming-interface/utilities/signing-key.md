# Signing Key

{% hint style="info" %}
The **SigningKey** class is directly imported from the [The Ethers Project](https://github.com/ethers-io/ethers.js/). The complete documentation can be found in the official [ethers docs](https://docs.ethers.io/v5/api/utils/signing-key/).
{% endhint %}

## Signing Key

#### `new hethers.utils.SigningKey( privateKey )`

Create a new SigningKey for _privateKey_.

#### signingKey.privateKey ⇒ string<[`DataHexString`](byte-manipulation.md#datahexstring)<32>>

The private key for this Signing Key.

#### `signingKey.publicKey ⇒ string<`[`DataHexString`](byte-manipulation.md#datahexstring)`<65>>`

The uncompressed public key for this Signing Key. It will always be 65 bytes (130 nibbles) and begins with `0x04`.

#### `signingKey.compressedPublicKey ⇒ string<`[`DataHexString`](byte-manipulation.md#datahexstring)`<33>>`

The compressed public key for this Signing Key. It will always be 33 bytes (66 nibbles) and begins with either `0x02` or `0x03`.

#### `signingKey.signDigest( digest ) ⇒` [`Signature`](byte-manipulation.md#signature)``

Sign the _digest_ and return the signature.

#### `signingKey.computeSharedSecret( otherKey ) ⇒ string<`[`DataHexString`](byte-manipulation.md#datahexstring)`<32>>`

Compute the ECDH shared secret with _otherKey_. The _otherKey_ may be either a public key or a private key, but generally will be a public key from another party.

It is best practice that each party computes the hash of this before using it as a symmetric key.

#### `SigningKey.isSigningKey( anObject ) ⇒ boolean`

Returns true if _anObject_ is a SigningKey.

### Other Functions

#### `hethers.utils.verifyMessage( message , signature ) ⇒ string<`[`Address`](addresses.md#address)`>`

Returns the address that signed _message_ producing _signature_. The signature may have a non-canonical v (i.e. does not need to be 27 or 28), in which case it will be normalized to compute the \`recoveryParam\` which will then be used to compute the address.

#### `hethers.utils.recoverPublicKey( digest , signature ) ⇒ string<`[`DataHexString`](byte-manipulation.md#datahexstring)`<65>>`

Returns the uncompressed public key (i.e. the first byte will be `0x04`) of the private key that was used to sign _digest_ which gave the _signature_.

#### `hethers.utils.computePublicKey( key [ , compressed = false ] ) ⇒ string<`[`DataHexString`](byte-manipulation.md#datahexstring)`>`

Computes the public key of _key_, optionally compressing it. The _key_ can be any form of public key (compressed or uncompressed) or a private key.
