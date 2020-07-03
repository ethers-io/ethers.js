-----

Documentation: [html](https://docs.ethers.io/)

-----

Experimental
============

BrainWallet
-----------

#### *BrainWallet* . **generate**( username , password [ , progressCallback ] ) => *[BrainWallet](/v5/api/experimental/#experimental-brainwallet)*

Generates a brain wallet, with a slightly improved experience, in which the generated wallet has a mnemonic.


#### *BrainWallet* . **generateLegacy**( username , password [ , progressCallback ] ) => *[BrainWallet](/v5/api/experimental/#experimental-brainwallet)*

Generate a brain wallet which is compatibile with the ethers v3 and earlier.


EIP1193Bridge
-------------

NonceManager
------------

#### **new ****NonceManager**( signer )

Create a new NonceManager.


#### *nonceManager* . **signer** => *[Signer](/v5/api/signer/#Signer)*

The signer whose nonce is being managed.


#### *nonceManager* . **provider** => *[Provider](/v5/api/providers/provider/)*

The provider associated with the signer.


#### *nonceManager* . **setTransactionCount**( count ) => *void*

Set the current transaction count (nonce) for the signer.

This may be useful it interacting with the signer outside of using this class.


#### *nonceManager* . **increaseTransactionCount**( [ count = 1 ] ) => *void*

Bump the current transaction count (nonce) by *count*.

This may be useful it interacting with the signer outside of using this class.


