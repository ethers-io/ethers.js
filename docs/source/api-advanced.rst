Low-Level API
**************

.. toctree::
    :maxdepth: 1
    :hidden:

These are advanced, low-level API features that should, for most people not be
necessary to worry about.

They are lightly documented here, and in the future will have more documentation,
but the emphasis at this point is documenting the more :ref:`common methdos <api>`.

-----

HDNode
======

A *Hierarchical Deterministic Wallet* represents a large tree of private keys
which can reliably be reproduced from an initial seed. Each node in the tree
is represended by an HDNode which can be descended into.

A *mnemonic phrase* represents a simple way to generate the initial seed.

See the `BIP 32 Specification`_ to learn more about HD Wallets and hardened vs
non-hardened nodes.

See the `BIP 39 Specification`_ to learn more about Mnemonic Phrases.


:sup:`prototype` **. privateKey**
    The hexidecimal private key for this node

:sup:`prototype` **. publicKey**
    The (compressed) public key for this node

:sup:`prototype` **. chainCode**
    The chain code for this node

:sup:`prototype` **. index**
    The index (from the parent) of this node (0 for the master node)

:sup:`prototype` **. depth**
    The depth within th hierarchy of this node

:sup:`prototype` **. derivePath** ( path )
    Derive the path from this node. Path is slash (**/**) delimited path components.
    The first component may be "m" for master (which enforces the starting node is
    infact a master node) and each subsequent path component should be a positive
    integer (up to 31 bits), which can optionally include an apostrophe (**'**) to
    indicate hardened derivation for that path components. See below for some examples.



Static Initializers
-------------------

:sup:`HDNode` **. fromMnemonic** ( mnemonic )
    blah

:sup:`HDNode` **. fromSeed** ( seed )
    blah


Static Functions
----------------

:sup:`HDNode` **. mnemonicToEntropy** ( mnemonic )
    blah

:sup:`HDNode` **. entropyToMnemonic** (entropy)
    blah

:sup:`HDNode` **. mnemonicToSeed** ( mnemonic )
    blah

:sup:`HDNode` **. isValidMnemonic** ( string )
    blah

*Example:* ::

    var HDNode = require('ethers').HDNode;
    var masterNode = HDNode.fromMnemonic(mnemonic);
    var standardEther = masterNoder.derivePath("m/44'/60'/0'/0/0");

-----

Interface
=========

blah

-----

Provider (Sub-Classing)
=======================

blah

-----

Signing Key
===========

The SigningKey interface provides an abstraction around the
*secp256k1 elliptic curve cryptography* library, which signs digests.

new :sup:`ethers` . _SigningKey( privateKey )
    foobar

:sup:`_SigningKey` . recover( digest, r, s, recoveryParam )
    foobar

:sup:`_SigningKey` . getPublicKey( value [, compressed] )
    foobar

:sup:`_SigningKey` . publicKeyToAddress( publicKey )
    foobar

Examples
--------

::

    Hello

-----

Recursive-Length Prefixed Encoding (RLP)
========================================

This encoding method is used internally for several aspects of Ethereum, such as
encoding transactions and determining contract addresses. For most developers this
should not be necessary to use.

RLP can encode nested arrays, with data as hex strings and Uint8Array (or other non-Array
arrayish objects). A decoded object will always have data represented as hex strings and
Arrays.

See: https://github.com/ethereum/wiki/wiki/RLP

*Examples*
----------

::

    var rlp = require('ethers-utils').rlp;

    var object = [ ["0x42"], "0x1234", [ [], [] ] ];

    var encoded = rlp.encode(object);
    console.log(encoded);
    // 0xc8c142821234c2c0c0

    var decoded = rlp.decode(encoded);
    console.log(decoded);
    // [ [ '0x42' ], '0x1234', [ [], [] ] ]

-----

Utilities (Low-Level)
=====================

For the most part these functions should not be required, but they are used
extensively within the library. If you require these, you must require the
sub-package, *ethers-utils*.


.. _arrayish:

Array Functions
---------------


utils.isArrayish ( object )
    Returns true if the object can be treated as an array. It must have a length
    property and return a valid byte (integer in the range [0, 255]) for each
    index from 0 to (but excluding) *length*.

utils.arrayify ( hexStringOrArrayish )
    Returns a Uint8Array representation of a hex string, BigNumber or of an `Arrayish`_ object.

utils.concat ( arrayOfHexStringsAndArrayish )
    Return an array created by the concatenation of all items in the array.

utils.padZeros ( array, length )
    Return a copy of the array with zeros added to pad to *length*.

utils.stripZeros ( arrayish )
    Returns a copy with all leading zeros striped



UTF-8 String Functions
----------------------



Hex String Functions
--------------------

:sup:`utils` . hexlify ( numberOrBigNumberOrHexStringOrArrayish )
    Converts any supported object to a hex string (otherwise, throws an error)

:sup:`utils` . isHexString ( object )
    Returns True if the object is a valid hex string


:sup:`utils` . isBigNumber ( object )
    returns true if the object is an instance of the BigNumber object we use.


.. _BIP 32 Specification: https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
.. _BIP 39 Specification: https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
