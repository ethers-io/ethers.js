.. |nbsp| unicode:: U+00A0 .. non-breaking space

Low-Level API
**************

These are advanced, low-level API features that should, for most people not be
necessary to worry about.

They are lightly documented here, and in the future will have more documentation,
but the emphasis at this point is documenting the more :ref:`common methods <api>`.

-----

ABI Coder
=========

Creating Instances
------------------

new :sup:`ethers . utils` **. AbiCoder** ( [ coerceFunc ] )
    Create a new ABI Coder object, which calls *coerceFunc* for each parsed value
    during decoding. The *coerceFunc* should have the signature: ``function(type, value)``.

Static Properties
-----------------

:sup:`ethers . utils` **. defaultAbiCoder**
    A default instance of the coder which can be used, which has a *coerceFunc*
    which will call ``toNumber()`` on BigNumbers whose **type** is less than
    53 bits and is safe for JavaScript Number instances.

Prototype
---------

:sup:`prototype` . encode ( types , values ) |nbsp| :sup:`=>` |nbsp| :sup:`hex`
    Returns a :ref:`hex string <hexstring>` of the *values* encoded as the *types*.
    Throws if a value is invalid for the type.

:sup:`prototype` . decode ( types , data ) |nbsp| :sup:`=>` |nbsp| :sup:`Result`
    Returns an Object by parsing *data* assuming *types*, with each parameter
    accessible as a positional parameters. Throws if *data* is invalid
    for the *types*.


-----

.. _api-hdnode:

HDNode
======

A *Hierarchical Deterministic Wallet* represents a large tree of private keys
which can reliably be reproduced from an initial seed. Each node in the tree
is represented by an HDNode which can be descended into.

A *mnemonic phrase* represents a simple way to generate the initial seed.

See the `BIP 32 Specification`_ to learn more about HD Wallets and hardened vs
non-hardened nodes.

See the `BIP 39 Specification`_ to learn more about Mnemonic Phrases.

Creating Instances
------------------

:sup:`ethers . utils . HDNode` **. fromMnemonic** ( mnemonic ) |nbsp| :sup:`=>` |nbsp| :sup:`HDNode`
    Create an HDNode from a *mnemonic* phrase.

:sup:`ethers . utils . HDNode` **. fromSeed** ( seed ) |nbsp| :sup:`=>` |nbsp| :sup:`HDNode`
    Create an HDNode from a seed.

:sup:`ethers . utils . HDNode` **. fromExtendedKey** ( extendedKey ) |nbsp| :sup:`=>` |nbsp| :sup:`HDNode`
    Create an HDNode from an extended private key (xpriv) or extended public key (xpub).


Prototype
---------

:sup:`prototype` **. privateKey**
    The :ref:`hex string <hexstring>` private key for this node.

:sup:`prototype` **. publicKey**
    The (compressed) public key for this node.

:sup:`prototype` **. chainCode**
    The chain code for this node.

:sup:`prototype` **. index**
    The index (from the parent) of this node (0 for the master node).

:sup:`prototype` **. depth**
    The depth within the hierarchy of this node.

:sup:`prototype` **. fingerprint**
    The fingerprint of this node. This can be used to identify a node, but wallets
    should handle collisions.

:sup:`prototype` **. parentFingerprint**
    The fingerprint of this node's parent (or 0x00000000 for the master node).

:sup:`prototype` **. extendedKey**
    The extended private key (xpriv) of the node, or the extended public key (xpub)
    if the node has been neutered.


Deriving Child and Neutered Nodes
---------------------------------

:sup:`prototype` **. derivePath** ( path ) |nbsp| :sup:`=>` |nbsp| :sup:`HDNode`
    Derive the path from this node. Path is slash (**/**) delimited path components.
    The first component may be "m" for master (which enforces the starting node is
    in fact a master node) and each subsequent path component should be a positive
    integer (up to 31 bits), which can optionally include an apostrophe (**'**) to
    indicate hardened derivation for that path components. See below for some examples.

:sup:`prototype` **. neuter** ( ) |nbsp| :sup:`=>` |nbsp| :sup:`HDNode`
    Returns a new instance of the node without a private key. This can be used to
    derive an extended public key. See the BIP32 standard for more details.


Static Methods
--------------

:sup:`ethers . utils . HDNode` **. mnemonicToEntropy** ( mnemonic ) |nbsp| :sup:`=>` |nbsp| :sup:`hex`
    Convert a *mnemonic* to its binary entropy. (throws an error if the checksum
    is invalid)

:sup:`ethers . utils . HDNode` **. entropyToMnemonic** ( entropy ) |nbsp| :sup:`=>` |nbsp| :sup:`string`
    Convert the binary *entropy* to the mnemonic phrase.

:sup:`ethers . utils . HDNode` **. mnemonicToSeed** ( mnemonic ) |nbsp| :sup:`=>` |nbsp| :sup:`hex`
    Compute the BIP39 seed from *mnemonic*.

:sup:`ethers . utils . HDNode` **. isValidMnemonic** ( string ) |nbsp| :sup:`=>` |nbsp| :sup:`boolean`
    Returns true if and only if the string is a valid mnemonic (including
    the checksum)

.. code-block:: javascript
    :caption: *HDNode derivation*

    let HDNode = require('ethers').utils.HDNode;

    let mnemonic = "radar blur cabbage chef fix engine embark joy scheme fiction master release";

    let masterNode = HDNode.fromMnemonic(mnemonic);

    let standardEthereum = masterNode.derivePath("m/44'/60'/0'/0/0");

    // Get the extended private key
    let xpriv = node.extendedKey;

    // Get the extended public key
    let xpub = node.neuter().extnededKey;

-----

.. _api-interface:

Interface
=========

The Interface Object is a meta-class that accepts a Solidity (or compatible)
Application Binary Interface (ABI) and populates functions to deal with encoding
and decoding the parameters to pass in and results returned.

Creating an Instance
--------------------

new :sup:`ethers . utils` . Interface ( abi )
    Returns a new instance and populates the properties with the ABI constructor,
    methods and events. The *abi* may be either a JSON string or the parsed JSON
    Object.


Prototype
---------

:sup:`prototype` . abi
    A **copy** of the ABI is returned, modifying this object will not alter the ABI.

:sup:`prototype` . deployFunction
    A DeployDesciption for the constructor defined in the ABI, or the default constructor
    if omitted.

:sup:`prototype` . events
    An object of all the events available in the ABI, by name and signature, which map
    to a EventDescription.

:sup:`prototype` . functions
    An object of all the functions available in the ABI, by name and signature, which map
    to a FunctionDescription.


Parsing Objects
---------------

:sup:`prototype` . parseTransaction ( transaction ) |nbsp| :sup:`=>` |nbsp| :sup:`TransactionDescription`
    Parse *transaction* and return a description of the call it represents.

:sup:`prototype` . parseLog ( log ) |nbsp| :sup:`=>` |nbsp| :sup:`LogDescription`
    Parse *log* and return a description of the event logs it represents.


Object Test Functions
---------------------

:sup:`prototype` . isInterface ( value ) |nbsp| :sup:`=>` |nbsp| :sup:`boolean`
    Returns true if *value* is an Interface.

:sup:`prototype` . isIndexed ( value ) |nbsp| :sup:`=>` |nbsp| :sup:`boolean`
    Returns true if *value* is a dynamic Indexed value, which means the actual
    value of *value* is the hash of the actual value.


Descriptions
------------

**Deploy Description**

    ============================== ======================================
    name                           description
    ============================== ======================================
    inputs                         The description of the constructor input parameters
    payable                        Whether the constructor can accept *Ether*
    encode(params)                 A function which encodes *params*
    ============================== ======================================

**Event Description**

    ============================== ======================================
    name                           description
    ============================== ======================================
    name                           The event name (e.g. "Transfer")
    signature                      The event signature (e.g. "Transfer(address indexed,address indexed,uint256)")
    inputs                         The event input parameters
    anonymous                      Whether the event is an anonymous event
    topic                          The topic for this event signature
    encodeTopics(params)           A function which computes filter topics for given *params*
    decode(data, topics)           A function to parse the log result *data* and *topics*
    ============================== ======================================

**Function Description**

    ============================== ======================================
    name                           description
    ============================== ======================================
    name                           The method name (e.g. "transfer")
    type                           The method type (i.e. "call" or "transaction")
    signature                      The method signature (e.g. "transfer(address to, uint256 amount)")
    sighash                        The signature hash of the signature (4 bytes)
    inputs                         The description of the method input parameters
    outputs                        The description of the method output parameters
    payable                        Whether the method can accept *Ether*
    gas                            The maximum gas this method will consume (null if unknown)
    encode(params)                 A function which encodes *params*
    decode(data)                   A function which decodes the result *data*
    ============================== ======================================

**Log Description**

    ============================== ======================================
    name                           description
    ============================== ======================================
    name                           The event name (e.g. "Transfer")
    signature                      The event signature (e.g. "Transfer(address indexed,address indexed,uint256)")
    topics                         The event topics
    decode(data, topics)           A function to parse the logs
    values                         The decoded values of the event
    ============================== ======================================

**Transaction Description**

    ============================== ======================================
    name                           description
    ============================== ======================================
    name                           The method name (e.g. "transfer")
    args                           The arguments passed to the method
    signature                      The method signature (e.g. "transfer(address to, uint256 amount)")
    sighash                        The signature hash of the signature (4 bytes)
    decode(data)                   A function to parse the result data
    value                          The value (in wei) of the transaction
    ============================== ======================================

-----

Provider (Sub-Classing)
=======================

See the :ref:`Provider API <api-provider>` for more common usage. This documentation
is designed for developers that are sub-classing BaseProvider.

Static Methods
--------------

:sup:`BaseProvider` . inherits ( childProvider ) |nbsp| :sup:`=>` |nbsp| :sup:`void`
    Set up *childProvider* as an provider, inheriting the parent prototype and
    set up a prototype.inherits on the *childProvider*.

Prototype
---------

:sup:`prototype` . perform ( method , params ) |nbsp| :sup:`=>` |nbsp| :sup:`Promise<any>`
    The only method needed to override in a subclass. All values are sanitized
    and defaults populated in params and the result is sanitized before returning.
    Returns a :ref:`Promise <promise>`, see the example below for overview of
    *method* and *params*.

.. code-block:: javascript
    :caption: *BaseProvider Sub-Class Stub*

    const ethers = require('ethers');

    // The new provider Object
    function DemoProvider(something) {

        let network = getNetworkSomehow()

        // The super must be called with either a Network or a Promise
        // that resolves to a Network
        ethers.providers.BaseProvider.call(this, network);

        ethers.utils.defineReadOnly(this, 'somethingElse', somethingElse);
    }

    // Inherit the Provider
    ethers.providers.BaseProvider.inherits(DemoProvider);

    // Override perform
    DemoProvider.prototype.perform = function(method, params) {
        switch (method) {
            case 'getBlockNumber':
                // Params:
                // { }

            case 'getGasPrice':
                // Params:
                // { }

            case 'getBalance':
                // Params:
                // {
                //     address: address,
                //     blockTag: blockTag
                // }

            case 'getTransactionCount':
                // Params:
                // {
                //     address: address,
                //     blockTag: blockTag
                // }

            case 'getCode':
                // Params:
                // {
                //     address: address,
                //     blockTag: blockTag
                // }

            case 'getStorageAt':
                // Params:
                // {
                //     address: address,
                //     position: hexString,
                //     blockTag: blockTag
                // }

            case 'sendTransaction':
                // Params:
                // {
                //     signedTransaction: hexString
                // }

            case 'getBlock':
                // Params:
                // Exactly one of the following will be specified, the other will be absent
                // {
                //     blockHash: blockHash,
                //     blockTag: blockTag
                // }

            case 'getTransaction':
                // Params:
                // {
                //     transactionHash: hexString
                // }

            case 'getTransactionReceipt':
                // Params:
                // {
                //     transactionHash: hexString
                // }

            case 'call':
                // Params:
                // {
                //     transaction: See Transaction Requests (on Providers API)
                // }

            case 'estimateGas':
                // Params:
                // {
                //     transaction: See Transaction Requests (on Providers API)
                // }

            case 'getLogs':
                // Params:
                // {
                //    address: address,
                //    fromBlock: blockTag,
                //    toBlock: blockTag,
                //    topics: array (possibly nested) of topics
                // }

            default:
                break;
        }

        return Promise.reject(new Error('not implemented - ' + method));
    };

-----

Recursive-Length Prefixed Encoding (RLP)
========================================

This encoding method is used internally for several aspects of Ethereum, such as
encoding transactions and determining contract addresses. For most developers this
should not be necessary to use.

RLP can encode nested arrays, with data as :ref:`hex strings <hexstring>` and Uint8Array (or other non-Array
:ref:`arrayish <arrayish>` objects). A decoded object will always have data represented as :ref:`hex strings <hexstring>` and
Arrays.

See: https://github.com/ethereum/wiki/wiki/RLP

Static Methods
--------------

:sup:`ethers . utils . RLP` . encode( object ) |nbsp| :sup:`=>` |nbsp| :sup:`hex`
    Encodes an object as an RLP :ref:`hex string <hexstring>`. (throws an Error if the object contains
    invalid items)

:sup:`ethers . utils . RLP` . decode( hexStringOrArrayish ) |nbsp| :sup:`=>` |nbsp| :sup:`any`
    Decode *hexStringOrArrayish* into the encoded object. (throws an Error if
    invalid RLP-coded data)

.. code-block:: javascript
    :caption: *RLP coder*

    let object = [ ["0x42"], "0x1234", [ [], [] ] ];

    let encoded = ethers.utils.RLP.encode(object);
    console.log(encoded);
    // 0xc8c142821234c2c0c0

    let decoded = ethers.utils.RLP.decode(encoded);
    console.log(decoded);
    // [ [ '0x42' ], '0x1234', [ [], [] ] ]

-----

Signing Key
===========

The SigningKey interface provides an abstraction around the
*secp256k1 elliptic curve cryptography* library, which signs digests,
computes public keys from private keys and performs *ecrecover* which
computes a public key from a digest and a signature.


Creating Instances
------------------

new :sup:`ethers . utils` . SigningKey ( privateKey )
    Create a new SigningKey and compute the corresponding public key and address.
    A private key may be a any :ref:`hex string <hexstring>` or an
    :ref:`Arrayish <arrayish>` representing 32 bytes.


Prototype
---------

:sup:`prototype` . address
    The Ethereum checksum address for this key pair.

:sup:`prototype` . privateKey
    The private key for the key pair.

:sup:`prototype` . publicKey
    The uncompressed public key for the key pair.


Cryptographic Operations
------------------------

:sup:`prototype` . signDigest ( messageDigest ) |nbsp| :sup:`=>` |nbsp| :sup:`Signature`
    The :ref:`expanded-format Signature <signature>` for the digests, signed
    by this key pair.

:sup:`prototype` . computeSharedSecret ( publicOrPrivateKey ) |nbsp| :sup:`=>` |nbsp| :sup:`hex`
    Compute the ECDH shared secret from this keys private key and the
    *publicOrPrivateKey*. In is generally considered good practice to
    further hash this value before using it as a key.


.. code-block:: javascript
    :caption: *Signing Key*

    const ethers = require('ethers');

    let privateKey = '0x0123456789012345678901234567890123456789012345678901234567890123';
    let signingKey = new ethers.utils.SigningKey(privateKey);

    console.log('Address: ' + signingKey.address);
    // "Address: 0x14791697260E4c9A71f18484C9f997B308e59325"

    let message = "Hello World";
    let messageBytes = ethers.utils.toUtf8Bytes(message);
    let messageDigest = ethers.utils.keccak256(messageBytes);

    console.log("Digest: " + messageDigest);
    // "Digest: 0x592fa743889fc7f92ac2a37bb1f5ba1daf2a5c84741ca0e0061d243a2e6707ba"

    let signature = signingKey.signDigest(messageDigest);

    console.log(signature);
    // {
    //    recoveryParam: 0,
    //    r: "0x79f56f3422dc67f57b2aeeb0b20295a99ec90420b203177f83d419c98beda7fe",
    //    s: "0x1a9d05433883bdc7e6d882740f4ea7921ef458a61b2cfe6197c2bb1bc47236fd"
    // }

    let recovered = ethers.utils.recoverAddress(messageDigest, signature);

    console.log("Recovered: " + recovered);
    // "Recovered: 0x14791697260E4c9A71f18484C9f997B308e59325"

    let publicKey = signingKey.publicKey;

    console.log('Public Key: ' + publicKey);
    // "Public Key: 0x026655feed4d214c261e0a6b554395596f1f1476a77d999560e5a8df9b8a1a3515"

    let compressedPublicKey = ethers.utlis.computePublicKey(publicKey, true);
    let uncompressedPublicKey = ethers.utils.computePublicKey(publicKey, false);

    console.log(compressedPublicKey);
    // "0x026655feed4d214c261e0a6b554395596f1f1476a77d999560e5a8df9b8a1a3515"

    console.log(uncompressedPublicKey);
    // "0x046655feed4d214c261e0a6b554395596f1f1476a77d999560e5a8df9b8a1a35" +
    //   "15217e88dd05e938efdd71b2cce322bf01da96cd42087b236e8f5043157a9c068e"

    let address = ethers.utils.computeAddress(publicKey);

    console.log('Address: ' + address);
    // "Address: 0x14791697260E4c9A71f18484C9f997B308e59325"


-----

.. _BIP 32 Specification: https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
.. _BIP 39 Specification: https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki

.. EOF
