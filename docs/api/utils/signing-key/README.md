-----

Documentation: [html](https://docs-beta.ethers.io/)

-----

Signing Key
===========



#### **new** *ethers* . *utils* . **SigningKey** ( privateKey ) 

Create a new SigningKey for *privateKey*.




#### *signingKey* . **privateKey** **=>** *string< [DataHexstring](../bytes)< 32 > >*

The private key for this Signing Key.




#### *signingKey* . **publicKey** **=>** *string< [DataHexstring](../bytes)< 65 > >*

The uncompressed public key for this Signing Key. It will always be
65 bytes (130 nibbles) and begine with `0x04`.




#### *signingKey* . **compressedPublicKey** **=>** *string< [DataHexstring](../bytes)< 33 > >*

The compressed public key for this Signing Key. It will always be
33 bytes (66 nibbles) and begine with either `0x02` or `0x03`.




#### *signingKey* . **signDisgest** ( digest )  **=>** *[Signature](../bytes)*

Sign the *digest* and return the signature.




#### *signingKey* . **computeSharedSecret** ( otherKey )  **=>** *string< [DataHexstring](../bytes)< 32 > >*

Compute the ECDH shared secret with *otherKey*. The *otherKey* may be
either a public key or a private key, but generally will be a public key from
another party.

It is best practice that each party computes the hash of this before using it
as a symmetric key.




#### *SigningKey* . **isSigningKey** ( anObject )  **=>** *boolean*

Returns true if *anObject* is a SigningKey.




Other Functions
---------------



#### *ethers* . *utils* . **verifyMessage** ( message , signature )  **=>** *string< [Address](../address) >*

Returns the address that signed *message* producing *signature*. The
signature may have a non-canonical v (i.e. does not need to be 27 or 28),
in which case it will be normalized to compute the `recoveryParam` which
will then be used to compute the address; this allows systems which use
the v to encode additional data (such as [EIP-155](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/eips.ethereum.org/EIPS/eip-155))
to be used since the v parameter is still completely non-ambiguous.




#### *ethers* . *utils* . **recocverPublicKey** ( digest , signature )  **=>** *string< [DataHexstring](../bytes)< 65 > >*






#### *ethers* . *utils* . **computePublicKey** ( key [  , compressed=false ]  )  **=>** *string< [DataHexstring](../bytes) >*

Computes the public key of *key*, optionally compressing it. The *key*
can be any form of public key (compressed or uncompressed) or a private
key.





-----
**Content Hash:** 285e65d57c4ba5901703c8a99e95632bd13aca7392d31734251d5d876e7df43e