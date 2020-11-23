-----

Documentation: [html](https://docs.ethers.io/)

-----

Signing Key
===========

#### **new ***ethers* . *utils* . **SigningKey**( privateKey )

Create a new SigningKey for *privateKey*.


#### *signingKey* . **privateKey** => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString)< 32 > >*

The private key for this Signing Key.


#### *signingKey* . **publicKey** => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString)< 65 > >*

The uncompressed public key for this Signing Key. It will always be 65 bytes (130 nibbles) and begins with `0x04`.


#### *signingKey* . **compressedPublicKey** => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString)< 33 > >*

The compressed public key for this Signing Key. It will always be 33 bytes (66 nibbles) and begins with either `0x02` or `0x03`.


#### *signingKey* . **signDigest**( digest ) => *[Signature](/v5/api/utils/bytes/#Signature)*

Sign the *digest* and return the signature.


#### *signingKey* . **computeSharedSecret**( otherKey ) => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString)< 32 > >*

Compute the ECDH shared secret with *otherKey*. The *otherKey* may be either a public key or a private key, but generally will be a public key from another party.

It is best practice that each party computes the hash of this before using it as a symmetric key.


#### *SigningKey* . **isSigningKey**( anObject ) => *boolean*

Returns true if *anObject* is a SigningKey.


Other Functions
---------------

#### *ethers* . *utils* . **verifyMessage**( message , signature ) => *string< [Address](/v5/api/utils/address/#address) >*

Returns the address that signed *message* producing *signature*. The signature may have a non-canonical v (i.e. does not need to be 27 or 28), in which case it will be normalized to compute the `recoveryParam` which will then be used to compute the address; this allows systems which use the v to encode additional data (such as [EIP-155](https://eips.ethereum.org/EIPS/eip-155)) to be used since the v parameter is still completely non-ambiguous.


#### *ethers* . *utils* . **verifyTypedData**( domain , types , value , signature ) => *string< [Address](/v5/api/utils/address/#address) >*

Returns the address that signed the [EIP-712](https://eips.ethereum.org/EIPS/eip-712) *value* for the *domain* and *types* to produce the signature.


#### *ethers* . *utils* . **recoverPublicKey**( digest , signature ) => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString)< 65 > >*

Returns the uncompressed public key (i.e. the first byte will be `0x04`) of the private key that was used to sign *digest* which gave the *signature*.


#### *ethers* . *utils* . **computePublicKey**( key [ , compressed = false ] ) => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString) >*

Computes the public key of *key*, optionally compressing it. The *key* can be any form of public key (compressed or uncompressed) or a private key.


