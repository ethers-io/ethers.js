Low-Level API
**************

These are advanced, low-level API features that should, for most people not be
necessary to worry about.

They are lightly documented here, and in the future will have more documentation,
but the emphasis at this point is documenting the more :ref:`common methods <api>`.

-----

.. _api-hdnode:

HDNode
======

A *Hierarchical Deterministic Wallet* represents a large tree of private keys
which can reliably be reproduced from an initial seed. Each node in the tree
is represended by an HDNode which can be descended into.

A *mnemonic phrase* represents a simple way to generate the initial seed.

See the `BIP 32 Specification`_ to learn more about HD Wallets and hardened vs
non-hardened nodes.

See the `BIP 39 Specification`_ to learn more about Mnemonic Phrases.

Creating Instances
------------------

:sup:`ethers . HDNode` **. fromMnemonic** ( mnemonic )
    Create an HDNode from a *mnemonic* phrase.

:sup:`ethers . HDNode` **. fromSeed** ( seed )
    Create an HDNode from a seed.


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
    The depth within th hierarchy of this node.

:sup:`prototype` **. derivePath** ( path )
    Derive the path from this node. Path is slash (**/**) delimited path components.
    The first component may be "m" for master (which enforces the starting node is
    infact a master node) and each subsequent path component should be a positive
    integer (up to 31 bits), which can optionally include an apostrophe (**'**) to
    indicate hardened derivation for that path components. See below for some examples.


Static Methods
--------------

:sup:`ethers . HDNode` **. mnemonicToEntropy** ( mnemonic )
    Convert a *mnemonic* to its binary entropy. (throws an error if the checksum
    is invalid)

:sup:`ethers . HDNode` **. entropyToMnemonic** ( entropy )
    Convert the binary *entropy* to the mnemonic phrase.

:sup:`ethers . HDNode` **. mnemonicToSeed** ( mnemonic )
    Compute the BIP39 seed from *mnemonic*.

:sup:`ethers . HDNode` **. isValidMnemonic** ( string )
    Returns true if and only if the string is a valid mnemonic (including
    the checksum)

*Examples*
----------

::

    var HDNode = require('ethers').HDNode;

    var mnemonic = "radar blur cabbage chef fix engine embark joy scheme fiction master release";

    var masterNode = HDNode.fromMnemonic(mnemonic);

    var standardEthereum = masterNode.derivePath("m/44'/60'/0'/0/0");

-----

.. _api-interface:

Interface
=========

The Interface Object is a meta-class that accepts a Solidity (or compatible)
Application Binary Interface (ABI) and populates functions to deal with encoding
and decoding the parameters to pass in and results returned.

Creating an Instance
--------------------

new :sup:`ethers` . Interface ( abi )
    Returns a new instance and populates the properties with the ABI constructor,
    methods and events. The *abi* may be either a JSON string or the parsed JSON
    Object.


Prototype
---------

:sup:`prototype` . abi
    A **copy** of the ABI is returned, modifying this object will not alter the ABI.

:sup:`prototype` . functions
    An object of the functions available in the ABI, by name. (collissions are dropped)

:sup:`prototype` . events
    An object of the events available in the ABI, by name. (collisions are dropped)

:sup:`prototype` . deployFunction ( bytecode [ , params... ])
    The function to deploy the contract (compiled to *bytecode*) to the network, passing
    *params* into the ABI constructor. If the ABI does not have a constructor, a default
    one is generated.


*Examples*
----------

**Creating an Interface Instance** ::

    var Interface = require('ethers').Interface;

    var abi = [
        {
            constant: true,
            inputs:[],
            name: "getValue",
            outputs:[ { name: "value", type: "string"} ],
            type: "function"
        },
        {
            constant: false,
            inputs: [ { name: "value", type: "string" } ],
            name: "setValue",
            outputs: [],
            type: "function"
        },
        {
            anonymous: false,
            inputs:[
                { indexed:false, name: "oldValue", type: "string" },
                { indexed:false, name: "newValue", type: "string" }
            ],
            name: "valueChanged",
            type: "event"
        }
    ];

    // NOTE: "interface" is a reserved keyword in JavaScript

    var iface = new Interface(abi)

**Call (Constant) Functions** ::

    var getValueInfo = iface.functions.getValue();

    console.log(getValueInfo);
    // {
    //     name: "getValue",
    //     signature: "getValue()",
    //     data: "0x20965255",
    //     parse: function(result),
    //     type: "call"
    // }

    // Here is the result of:
    // provider.call({
    //    to: "0x954De93D9f1Cd1e2e3AE5964F614CDcc821Fac64",
    //    data: getValue.data,
    // }).then(function(result) {
    //    console.log(result);
    // });
    var getDataResult = "0x0000000000000000000000000000000000000000000000000000000000000020" +
                          "000000000000000000000000000000000000000000000000000000000000000b" +
                          "48656c6c6f20576f726c64000000000000000000000000000000000000000000"

     console.log(getValueInfo.parse(getDataResult));
     // {
     //    0: "Hello World",
     //    value: "Hello World",
     //    length: 1
     // }


**Transaction (Non-Constant) Functions** ::

     var setValueInfo = iface.functions.setValue("Foobar!");

     console.log(setValueInfo);
     // {
     //     name: "setValue",
     //     signature: "setValue(string)",
     //     data: "0x93a09352" +
     //             "0000000000000000000000000000000000000000000000000000000000000020" +
     //             "0000000000000000000000000000000000000000000000000000000000000007" +
     //             "466f6f6261722100000000000000000000000000000000000000000000000000"
     //     type: "transaction"
     // }

     // To send this to the network, you would sign and send the transaction:
     // {
     //     to: "0x954De93D9f1Cd1e2e3AE5964F614CDcc821Fac64",
     //     data: setValueInfo.data,
     //     gasLimit: someGasLimit,
     //     gasPrice: someGasPrice,
     //     nonce: yourTransactionCountForYourAddress
     // }

**Events** ::
   
    var ethers = require('ethers');
    var Interface = ethers.Interface;
    var abi = [
        {
            anonymous: false,
            inputs:[
                { indexed:true, name: "from", type: "address" },
                { indexed:true, name: "to", type: "address" },
                { indexed:false, name: "value", type: "uint256" }
            ],
            name: "Transfer",
            type: "event"
        }
    ];
    // NOTE: "interface" is a reserved keyword in JavaScript
    var iface = new Interface(abi)
    var transferInfo = iface.events.Transfer();
    console.log(transferInfo);
    // EventDescription {
    //    inputs: 
    //      [ { indexed: true, name: 'from', type: 'address' },
    //        { indexed: true, name: 'to', type: 'address' },
    //        { indexed: false, name: 'value', type: 'uint256' } ],
    //    name: 'Transfer',
    //    signature: 'Transfer(address,address,uint256)',
    //    topics: [ '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' ],
    //    parse: [Function] }


    // To listen for this event:
    var provider = ethers.providers.getDefaultProvider();
    provider.on(transferInfo.topics, function(log) {
        // Parse event data (only returns the non-indexed entries)
        var result = transferInfo.parse(log.data);
        console.log('non-indexed entries: ', result);

        // non-indexed entries:  Result {
        //   '0': Indexed { indexed: true, hash: null },
        //   '1': Indexed { indexed: true, hash: null },
        //   '2': BigNumber { _bn: <BN: 1db3c5934d11e3c0000> },
        //   from: Indexed { indexed: true, hash: null },
        //   to: Indexed { indexed: true, hash: null },
        //   value: BigNumber { _bn: <BN: 1db3c5934d11e3c0000> },
        //   length: 3 }
      

        // Parse event topics and data (returns all entries)
        // Note: Any indexed entry which is not a 32 byte value is hashed.
        //       Dynamic arrays are hashed as a static sized array.
        result = transferInfo.parse(log.topics, log.data);
        console.log('all entries: ', result);

        // all entries:  Result {
        //   '0': '0x0000000000000000000000000000000000000000',
        //   '1': '0x92239D0512c313E1b001b3996707F822a76C0901',
        //   '2': BigNumber { _bn: <BN: 1db3c5934d11e3c0000> },
        //   from: '0x0000000000000000000000000000000000000000',
        //   to: '0x92239D0512c313E1b001b3996707F822a76C0901',
        //   value: BigNumber { _bn: <BN: 1db3c5934d11e3c0000> },
        //   length: 3 }
    });

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

:sup:`prototype` . encode ( [ names , ] types , values )
    Returns a :ref:`hex string <hexstring>` of the *values* encoded as the *types*.
    If names is provided, *values* may contain named keys for tuples, otherwise
    each tuple expects an Array. Throws if a value is invalid for the type.

:sup:`prototype` . decode ( [ names , ] types , data )
    Returns an Object by parsing *data* assuming *types*, with each parameter
    accessible as apositional parameters. If *names* is provided, each
    parameter is also accessible by its name. Throws if *data* is invalid
    for the *types*.


-----

Provider (Sub-Classing)
=======================

See the :ref:`Provider API <api-provider>` for more common usage. This documentation
is designed for developers that are sub-classing Provider.

Static Methods
--------------

:sup:`Provider` . inherits ( childProvider )
    Set up *childProvider* as an provider, inheriting the parent prototype and
    set up a prototype.inherits on the *childProvider*.

:sup:`Provider` . fetchJSON ( url , body , processFunc )
    Convenience method for returning a :ref:`Promise <promise>` with the result of fetching JSON
    from a *url* with an optional *body*. The optional *processFunc* is called on
    the parsed JSON before being passed to the Promise's resolve. (throwing an error
    in the *processFunc* will cause the Promise to reject)

Prototype
---------

:sup:`prototype` . perform ( method , params )
    The only method needed to override in a subclass. All values are sanitized
    and defaults populated in params and the result is sanitized before returning.
    Returns a :ref:`Promise <promise>`, see the example below for overview of
    *method* and *params*.

*Examples*
----------

::

    var ethers = require('ethers');
    var utils = ethers.utils;
    var Provider = ethers.providers.Provider;

    // The new provider Object
    function DemoProvider(testnet, somethingElse) {
        Provide.call(this, testnet);

        utils.defineProperty(this, 'somethingElse', somethingElse);
    }

    // Inherit the Provider
    Provider.inherits(DemoProvider);

    // Override perform
    utils.defineProperty(DemoProvider.prototype, 'perform', function(method, params) {
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
    });

-----

Signing Key
===========

The SigningKey interface provides an abstraction around the
*secp256k1 elliptic curve cryptography* library, which signs digests,
computes public keys from private keys and performs *ecrecover* which
computes a public key from a digest and a signature.


Creating Instances
------------------

new :sup:`ethers` . SigningKey ( privateKey )
    Create a new SigningKey and compute the corresponding public key and address.
    A private key may be a any :ref:`hex string <hexstring>` or an
    :ref:`Arrayish <api-arrayish>` representing 32 bytes.


Static Methods
--------------

:sup:`SigningKey` . recover ( digest, r, s, recoveryParam )
    Given a message *digest* and the signature parameters *r*, *s*
    and *recoveryParam* compute the the address that signed the
    message.

:sup:`SigningKey` . getPublicKey ( publicOrPrivateKey [, compressed] )
    Given a *publicOrPrivateKey*, return the public key, optionally *compressed*.

    **default:** *compressed*\ =false

:sup:`SigningKey` . publicKeyToAddress ( publicOrPrivateKey )
    Convert a *publicOrPrivateKey* to an Ethereum address.

Prototype
---------

:sup:`prototype` . privateKey
    The private key.

:sup:`prototype` . publicKey
    The compressed public key.

:sup:`prototype` . address
    The Ethereum address for this key pair.

:sup:`prototype` . signDigest ( messageDigest )
    The compressed public key


*Examples*
----------

::

    var ethers = require('ethers');
    var SigningKey = ethers._SigningKey;

    var privateKey = '0x0123456789012345678901234567890123456789012345678901234567890123';
    var signingKey = new SigningKey(privateKey);

    console.log('Address: ' + signingKey.address);
    // "Address: 0x14791697260E4c9A71f18484C9f997B308e59325"

    var message = "Hello World";
    var messageBytes = ethers.utils.toUtf8Bytes(message);
    var messageDigest = ethers.utils.keccak256(messageBytes);

    console.log("Digest: " + messageDigest);
    // "Digest: 0x592fa743889fc7f92ac2a37bb1f5ba1daf2a5c84741ca0e0061d243a2e6707ba"

    var signature = signingKey.signDigest(messageDigest);

    console.log(signature);
    // {
    //    recoveryParam: 0,
    //    r: "0x79f56f3422dc67f57b2aeeb0b20295a99ec90420b203177f83d419c98beda7fe",
    //    s: "0x1a9d05433883bdc7e6d882740f4ea7921ef458a61b2cfe6197c2bb1bc47236fd"
    // }

    var recovered = SigningKey.recover(messageDigest, signature.r,
                        signature.s, signature.recoveryParam);

    console.log("Recovered: " + recovered);
    // "Recovered: 0x14791697260E4c9A71f18484C9f997B308e59325"

    var publicKey = signingKey.publicKey;

    console.log('Public Key: ' + publicKey);
    // "Public Key: 0x026655feed4d214c261e0a6b554395596f1f1476a77d999560e5a8df9b8a1a3515"

    var compressedPublicKey = SigningKey.getPublicKey(publicKey, true);
    var uncompressedPublicKey = SigningKey.getPublicKey(publicKey, false);

    console.log('Compressed: ' + compressedPublicKey);
    // "Compressed: 0x026655feed4d214c261e0a6b554395596f1f1476a77d999560e5a8df9b8a1a3515"

    console.log('Uncompressed: ' + uncompressedPublicKey);
    // "Uncompressed: 0x046655feed4d214c261e0a6b554395596f1f1476a77d999560e5a8df9b8a1a35" +
    // "15217e88dd05e938efdd71b2cce322bf01da96cd42087b236e8f5043157a9c068e"

    var address = SigningKey.publicKeyToAddress(publicKey);

    console.log('Address: ' + address);
    // "Address: 0x14791697260E4c9A71f18484C9f997B308e59325"


-----

Recursive-Length Prefixed Encoding (RLP)
========================================

This encoding method is used internally for several aspects of Ethereum, such as
encoding transactions and determining contract addresses. For most developers this
should not be necessary to use.

RLP can encode nested arrays, with data as :ref:`hex strings <hexstring>` and Uint8Array (or other non-Array
:ref:`arrayish <api-arrayish>` objects). A decoded object will always have data represented as :ref:`hex strings <hexstring>` and
Arrays.

See: https://github.com/ethereum/wiki/wiki/RLP

Static Methods
--------------

:sup:`ethers . utils . RLP` . encode( object )
    Encodes an object as an RLP :ref:`hex string <hexstring>`. (throws an Error if the object contains
    invalid items)

:sup:`ethers . utils . RLP` . decode( hexStringOrArrayish )
    Decode *hexStringOrArrayish* into the encoded object. (throws an Error if
    invalid RLP-coded data)

*Examples*
----------

::

    var rlp = require('ethers').utils.RLP;

    var object = [ ["0x42"], "0x1234", [ [], [] ] ];

    var encoded = rlp.encode(object);
    console.log(encoded);
    // 0xc8c142821234c2c0c0

    var decoded = rlp.decode(encoded);
    console.log(decoded);
    // [ [ '0x42' ], '0x1234', [ [], [] ] ]

-----

.. _BIP 32 Specification: https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
.. _BIP 39 Specification: https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki

.. EOF
