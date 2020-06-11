.. |nbsp| unicode:: U+00A0 .. non-breaking space

Utilities
*********

The utility functions provide a large assortment of common utility functions
required to write dapps, process user input and format data.

-----

Addresses
=========

There are :ref:`several formats <checksum-address>` available to represent Ethereum
addresses and various ways they are determined.

.. _utils-getaddress:

:sup:`utils` . getAddress ( address ) |nbsp| :sup:`=>` |nbsp| :sup:`Address`
    Normalize any supported address-format to a :ref:`checksum address <checksum-address>`.

:sup:`utils` . getIcapAddress ( address ) |nbsp| :sup:`=>` |nbsp| :sup:`hex`
    Normalize any supported address-format to a :ref:`ICAP address <icap-address>`.

:sup:`utils` . getContractAddress ( transaction ) |nbsp| :sup:`=>` |nbsp| :sup:`Address`
    Computes the contract address of a contract deployed by *transaction*. The only
    properties used are *from* and *nonce*.

.. code-block:: javascript
    :caption: *convert between address formats*

    let address = "0xd115bffabbdd893a6f7cea402e7338643ced44a6";
    let icapAddress = "XE93OF8SR0OWI6F4FO88KWO4UNNGG1FEBHI";

    console.log(utils.getAddress(address));
    // "0xD115BFFAbbdd893A6f7ceA402e7338643Ced44a6"

    console.log(utils.getAddress(icapAddress));
    // "0xD115BFFAbbdd893A6f7ceA402e7338643Ced44a6"

    console.log(utils.getAddress(address, true));
    // "XE93OF8SR0OWI6F4FO88KWO4UNNGG1FEBHI"

    console.log(utils.getAddress(icapAddress, true));
    // "XE93OF8SR0OWI6F4FO88KWO4UNNGG1FEBHI"


.. code-block:: javascript
    :caption: *determine a contract address*

    // Ropsten: 0x5bdfd14fcc917abc2f02a30721d152a6f147f09e8cbaad4e0d5405d646c5c3e1
    let transaction = {
        from: '0xc6af6e1a78a6752c7f8cd63877eb789a2adb776c',
        nonce: 0
    };

    console.log(utils.getContractAddress(transaction));
    // "0x0CcCC7507aEDf9FEaF8C8D731421746e16b4d39D"


-----

.. _arrayish:

Arrayish
========

An arrayish object is used to describe binary data and has the following conditions met:

    - has a *length* property
    - has a value for each index from 0 up to (but excluding) *length*
    - has a valid byte for each value; a byte is an integer in the range [0, 255]
    - is **not** a string

**Examples:** ``Buffer``, ``[ 1, 2, 3 ]``, ``Uint8Array``

:sup:`utils` . isArrayish ( object ) |nbsp| :sup:`=>` |nbsp| :sup:`boolean`
    Returns true if *object* can be treated as an arrayish object.

:sup:`utils` . arrayify ( hexStringOrBigNumberOrArrayish ) |nbsp| :sup:`=>` |nbsp| :sup:`Uint8Array`
    Returns a Uint8Array of a hex string, BigNumber or of an `Arrayish`_ object.

:sup:`utils` . concat ( arrayOfHexStringsAndArrayish ) |nbsp| :sup:`=>` |nbsp| :sup:`Uint8Array`
    Return a Uint8Array of all *arrayOfHexStringsAndArrayish* concatenated.

:sup:`utils` . padZeros ( typedUint8Array, length ) |nbsp| :sup:`=>` |nbsp| :sup:`Uint8Array`
    Return a Uint8Array of *typedUint8Array* with zeros prepended to *length* bytes.

:sup:`utils` . stripZeros ( hexStringOrArrayish ) |nbsp| :sup:`=>` |nbsp| :sup:`Uint8Array`
    Returns a Uint8Array with all leading zero **bytes** striped.

-----

.. _bignumber:

Big Numbers
===========

A BigNumber is an immutable object which allow accurate math operations
on values larger than :ref:`JavaScript can accurately handle <ieee754>`
can safely handle. Also see: :ref:`Constants <constants>`

:sup:`prototype` . add ( otherValue ) |nbsp| :sup:`=>` |nbsp| :sup:`BigNumber`
    Return a new BigNumber of this plus *otherValue*.

:sup:`prototype` . sub ( otherValue ) |nbsp| :sup:`=>` |nbsp| :sup:`BigNumber`
    Return a new BigNumber of this minus *otherValue*.

:sup:`prototype` . mul ( otherValue ) |nbsp| :sup:`=>` |nbsp| :sup:`BigNumber`
    Return a new BigNumber of this times *otherValue*.

:sup:`prototype` . div ( otherValue ) |nbsp| :sup:`=>` |nbsp| :sup:`BigNumber`
    Return a new BigNumber of this divided by *otherValue*.

:sup:`prototype` . mod ( otherValue ) |nbsp| :sup:`=>` |nbsp| :sup:`BigNumber`
    Return a new BigNumber of this modulo *otherValue*.

:sup:`prototype` . maskn ( bits ) |nbsp| :sup:`=>` |nbsp| :sup:`BigNumber`
    Return a new BigNumber with the number of *bits* masked.

:sup:`prototype` . eq ( otherValue ) |nbsp| :sup:`=>` |nbsp| :sup:`boolean`
    Return true if this is equal to *otherValue*.

:sup:`prototype` . lt ( otherValue ) |nbsp| :sup:`=>` |nbsp| :sup:`boolean`
    Return true if this is less than *otherValue*.

:sup:`prototype` . lte ( otherValue ) |nbsp| :sup:`=>` |nbsp| :sup:`boolean`
    Return true if this is less or equal to *otherValue*.

:sup:`prototype` . gt ( otherValue ) |nbsp| :sup:`=>` |nbsp| :sup:`boolean`
    Return true if this is greater than *otherValue*.

:sup:`prototype` . gte ( otherValue ) |nbsp| :sup:`=>` |nbsp| :sup:`boolean`
    Return true if this is greater than or equal to *otherValue*.

:sup:`prototype` . isZero ( ) |nbsp| :sup:`=>` |nbsp| :sup:`boolean`
    Return true if this is equal to zero.

:sup:`prototype` . toNumber ( ) |nbsp| :sup:`=>` |nbsp| :sup:`number`
    Return a JavaScript number of the value.

    An error is thrown if the value is outside the safe range for JavaScript
    IEEE 754 64-bit floating point numbers (over 53 bits of mantissa).

:sup:`prototype` . toString () |nbsp| :sup:`=>` |nbsp| :sup:`string`
    Return a decimal string representation.

:sup:`prototype` . toHexString ( ) |nbsp| :sup:`=>` |nbsp| :sup:`hex`
    Return a hexstring representation of the value.


Creating Instances
------------------

:sup:`utils` . bigNumberify ( value ) |nbsp| :sup:`=>` |nbsp| :sup:`BigNumber`
    Returns a BigNumber instance of *value*. The *value* may be anything that can
    reliably be converted into a BigNumber:

    ============================ ======================= =================================
    Type                         Examples                Notes
    ============================ ======================= =================================
    decimal string               ``"42"``, ``"-42"``
    hexadecimal string           ``"0x2a"``, ``"-0x2a"`` case-insensitive
    numbers                      ``42``, ``-42``         must be witin the `safe range`_
    :ref:`Arrayish <arrayish>`   ``[ 30, 252 ]``         big-endian encoding
    BigNumber                    any other BigNumber     returns the same instance
    ============================ ======================= =================================

.. code-block:: javascript
    :caption: *examples*

    let gasPriceWei = utils.bigNumberify("20902747399");
    let gasLimit = utils.bigNumberify(3000000);

    let maxCostWei = gasPriceWei.mul(gasLimit)
    console.log("Max Cost: " + maxCostWei.toString());
    // "Max Cost: 62708242197000000"

    console.log("Number: " + maxCostWei.toNumber());
    // throws an Error, the value is too large for JavaScript to handle safely

-----

.. _bytes32string:

Bytes32 Strings
===============

Often for short strings, it is far more efficient to store them as
a fixed, null-terminated bytes32, instead of a dynamic length-prefixed
bytes.

:sup:`utils` . formatBytes32String ( text ) |nbsp| :sup:`=>` |nbsp| :sup:`hex`
    Returns a :ref:`hex string <hexstring>` representation of *text*, exactly
    32 bytes wide. Strings **must** be 31 bytes or shorter, or an exception
    is thrown.

    **NOTE:** Keep in mind that UTF-8 characters outside the ASCII range can
    be multiple bytes long.

:sup:`utils` . parseBytes32String ( hexStringOrArrayish ) |nbsp| :sup:`=>` |nbsp| :sup:`string`
    Returns *hexStringOrArrayish* as the original string, as generated by ``formatBytes32String``.

.. code-block:: javascript
    :caption: *example*

    let text = "Hello World!"

    let bytes32 = ethers.utils.formatBytes32String(text)
    // "0x48656c6c6f20576f726c64210000000000000000000000000000000000000000"

    let originalText = ethers.utils.parseBytes32String(bytes32)
    // "Hello World!"


-----

.. _constants:

Constants
=========

:sup:`ethers . constants` . AddressZero
    The address ``0x0000000000000000000000000000000000000000``.

:sup:`ethers . constants` . HashZero
    The bytes32 ``0x0000000000000000000000000000000000000000000000000000000000000000``.

:sup:`ethers . constants` . MaxUint256
    The bytes32 ``0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff``.

:sup:`ethers . constants` . NegativeOne
    The :ref:`BigNumber <bignumber>` ``bigNumberify(-1)``.

:sup:`ethers . constants` . Zero
    The :ref:`BigNumber <bignumber>` ``bigNumberify(0)``.

:sup:`ethers . constants` . One
    The :ref:`BigNumber <bignumber>` ``bigNumberify(1)``.

:sup:`ethers . constants` . Two
    The :ref:`BigNumber <bignumber>` ``bigNumberify(2)``.

:sup:`ethers . constants` . WeiPerEther
    The :ref:`BigNumber <bignumber>` ``bigNumberify("1000000000000000000")``.

:sup:`ethers . constants` . EtherSymbol
    The Greek character Xi, used as the symbol for *ether*.

-----

Cryptographic Functions
=======================

Elliptic Curve
--------------

:sup:`utils` . computeAddress ( publicOrPrivateKey ) |nbsp| :sup:`=>` |nbsp| :sup:`Address`
    Computes the Ethereum address given a public key or private key.

:sup:`utils` . computePublicKey ( publicOrPrivateKey [ , compressed :sup:`= false` ] ) |nbsp| :sup:`=>` |nbsp| :sup:`hex`
    Compute the public key for *publicOrPrivateKey*, optionally *compressed*. If
    *publicOrPrivateKey* is a public key, it may be either compressed or uncompressed.

:sup:`utils` . recoverAddress ( digest , signature ) |nbsp| :sup:`=>` |nbsp| :sup:`Address`
    Returns the Ethereum address by using ecrecover with the *digest* for the
    *signature*.

:sup:`utils` . recoverPublicKey ( digest , signature ) |nbsp| :sup:`=>` |nbsp| :sup:`hex`
    Returns the public key by using ecrecover with the *digest* for the *signature*.

:sup:`utils` . verifyMessage ( messageStringOrArrayish , signature ) |nbsp| :sup:`=>` |nbsp| :sup:`Addresss`
    Returns the address of the account that signed *messageStringOrArrayish* to
    generate *signature*.

.. code-block:: javascript
    :caption: *verify a message signature*

    let signature = "0xddd0a7290af9526056b4e35a077b9a11b513aa0028ec6c9880948544508f3c63" +
                      "265e99e47ad31bb2cab9646c504576b3abc6939a1710afc08cbf3034d73214b8" +
                      "1c";

    let signingAddress = Wallet.verifyMessage('hello world', signature);

    console.log(signingAddress);
    // "0x14791697260E4c9A71f18484C9f997B308e59325"

Hash Functions
--------------

:sup:`utils` . keccak256 ( hexStringOrArrayish ) |nbsp| :sup:`=>` |nbsp| :sup:`hex`
    Compute the keccak256 cryptographic hash of a value, returned as a hex string. (Note:
    often Ethereum documentation refers to this, **incorrectly**, as SHA3)

:sup:`utils` . sha256 ( hexStringOrArrayish ) |nbsp| :sup:`=>` |nbsp| :sup:`hex`
    Compute the SHA2-256 cryptographic hash of a value, returned as a hex string.

.. code-block:: javascript
    :caption: *hashing binary data*

    console.log(utils.keccak256([ 0x42 ]));
    // '0x1f675bff07515f5df96737194ea945c36c41e7b4fcef307b7cd4d0e602a69111'

    console.log(utils.keccak256("0x42"));
    // '0x1f675bff07515f5df96737194ea945c36c41e7b4fcef307b7cd4d0e602a69111'


    console.log(utils.sha256([ 0x42 ]));
    // '0xdf7e70e5021544f4834bbee64a9e3789febc4be81470df629cad6ddb03320a5c'

    console.log(utils.sha256("0x42"));
    // '0xdf7e70e5021544f4834bbee64a9e3789febc4be81470df629cad6ddb03320a5c'


Hash Function Helpers
---------------------

:sup:`utils` . hashMessage ( stringOrArrayish ) |nbsp| :sup:`=>` |nbsp| :sup:`hex`
    Compute the prefixed message hash of a stringOrArrayish, by converting the
    message to bytes (as necessary) and prefixing with ``\x19Ethereum Signed Message\n``
    and the length of the message. See the `eth_sign`_ JSON-RPC method for more information.

:sup:`utils` . id ( utf8String ) |nbsp| :sup:`=>` |nbsp| :sup:`hex`
    Compute the keccak256 cryptographic hash of a UTF-8 string, returned as a hex string.

.. code-block:: javascript
    :caption: *hashing utf-8 strings*

    // Convert the string to binary data
    let message = "Hello World";
    let messageBytes = utils.toUtf8Bytes(message);
    utils.keccak256(messageBytes);
    // '0x592fa743889fc7f92ac2a37bb1f5ba1daf2a5c84741ca0e0061d243a2e6707ba'

    // Which is equivalent to using the id function
    utils.id("Hello World");
    // '0x592fa743889fc7f92ac2a37bb1f5ba1daf2a5c84741ca0e0061d243a2e6707ba'


    // Compute the sighash for a Solidity method
    console.log(utils.id("addr(bytes32)"));
    // '0x3b3b57de213591bb50e06975ea011e4c8c4b3e6de4009450c1a9e55f66e4bfa4'

Key Derivation
--------------

:sup:`utils` . pbkdf2 ( password , salt , iterations , keylen , hashAlgorithm )
    Return the pbkdf2 derived key from *password* and *salt* with *iterations* of
    *length* using the *hashAlgorithm*. The supported hash algorithms are ``sha256``
    and ``sha512``.

Random
------

:sup:`utils` . randomBytes ( length ) |nbsp| :sup:`=>` |nbsp| :sup:`Uint8Array`
    Return a Uint8Array of cryptographically secure random bytes

.. code-block:: javascript
    :caption: *generate random bytes*

    let randomBytes3 = utils.randomBytes(3)
    // Uint8Array [ 194, 22, 140 ]

    let randomBytes32 = utils.randomBytes(32)
    // Uint8Array [ 162, 131, 117, 110, 196, 73, 144, 177, 201, 75, 88,
    //              105, 227, 210, 104, 226, 82, 65, 103, 157, 36, 170,
    //              214, 92, 190, 141, 239, 54, 96, 39, 240, 95 ]


.. code-block:: javascript
    :caption: *generate a random number*

    let randomNumber = utils.bigNumberify(utils.randomBytes(32));
    // BigNumber { _hex: 0x617542634156966e0bbb6c673bf88015f542c96eb115186fd93881518f05f7ff }

Solidity
--------

Solidity uses a `non-standard packed mode`_ to encode parameters that are passed
into its hashing functions. The parameter types and values can be used to compute
the result of the hash functions as would be performed by Solidity.

:sup:`utils` . solidityKeccak256 ( types, values ) |nbsp| :sup:`=>` |nbsp| :sup:`hex`
    Compute the keccak256 cryptographic hash using the Solidity non-standard (tightly)
    packed data for *values* given the *types*.

:sup:`utils` . soliditySha256 ( types, values ) |nbsp| :sup:`=>` |nbsp| :sup:`hex`
    Compute the SHA256 cryptographic hash using the Solidity non-standard (tightly)
    packed data for *values* given the *types*.

:sup:`utils` . solidityPack ( types, values ) |nbsp| :sup:`=>` |nbsp| :sup:`hex`
    Compute the Solidity non-standard (tightly) packed data for *values* given the *types*.

.. code-block:: javascript
    :caption: *examples*

    let result = utils.solidityKeccak256([ 'int8', 'bytes1', 'string' ], [ -1, '0x42', 'hello' ]);
    console.log(result);
    // '0x52d7e6a62ca667228365be2143375d0a2a92a3bd4325dd571609dfdc7026686e'

    result = utils.soliditySha256([ 'int8', 'bytes1', 'string' ], [ -1, '0x42', 'hello' ]);
    console.log(result);
    // '0x1eaebba7999af2691d823bf0c817e635bbe7e89ec7ed32a11e00ca94e86cbf37'

    result = utils.solidityPack([ 'int8', 'bytes1', 'string' ], [ -1, '0x42', 'hello' ]);
    console.log(result);
    // '0xff4268656c6c6f'

-----


Ether Strings and Wei
=====================

:sup:`utils` . etherSymbol
    The ethereum symbol (the Greek letter *Xi* )

.. _parseEther:

:sup:`utils` . parseEther ( etherString ) |nbsp| :sup:`=>` |nbsp| :sup:`BigNumber`
    Parse the *etherString* representation of ether into a BigNumber instance
    of the amount of wei.

.. _formatEther:

:sup:`utils` . formatEther ( wei ) |nbsp| :sup:`=>` |nbsp| :sup:`string`
    Format an amount of *wei* into a decimal string representing the amount of ether.
    The output will always include at least one whole number and at least one decimal
    place, otherwise leading and trailing 0's will be trimmed.

.. _parseUnits:

:sup:`utils` . parseUnits ( valueString , decimalsOrUnitName ) |nbsp| :sup:`=>` |nbsp| :sup:`BigNumber`
    Parse the *valueString* representation of units into a BigNumber instance
    of the amount of wei. The *decimalsOrUnitsName* may be a number of decimals between
    3 and 18 (multiple of 3) or a name, such as `gwei`.

.. _formatUnits:

:sup:`utils` . formatUnits ( wei , decimalsOrUnitName ) |nbsp| :sup:`=>` |nbsp| :sup:`string`
    Format an amount of *wei* into a decimal string representing the amount of units. 
    The output will always include at least one whole number and at least one decimal place,
    otherwise leading and trailing 0's will be trimmed. The *decimalsOrUnitsName*
    may be a number of decimals between 3 and 18 (multiple of 3) or a name, such as `gwei`.

:sup:`utils` . commify ( numberOrString ) |nbsp| :sup:`=>` |nbsp| :sup:`string`
    Returns *numberOrString* with commas placed at every third position within the whole
    component. If *numberOrString* contains a decimal point, the output will as well with
    at least one digit for both the whole and decimal components. If there no decimal,
    then the output will also not contain a decimal.


.. code-block:: javascript
    :caption: *examples*

    let wei = utils.parseEther('1000.0');
    console.log(wei.toString(10));
    // "1000000000000000000000"

    console.log(utils.formatEther(0));
    // "0.0"

    let wei = utils.bigNumberify("1000000000000000000000");

    console.log(utils.formatEther(wei));
    // "1000.0"

    console.log(utils.formatEther(wei, {commify: true}));
    // "1,000.0"

    console.log(utils.formatEther(wei, {pad: true}));
    // "1000.000000000000000000"       (18 decimal places)

    console.log(utils.formatEther(wei, {commify: true, pad: true}));
    // "1,000.000000000000000000"      (18 decimal places)


-----

.. _hexstring:

Hex Strings
===========

A hex string is **always** prefixed with "0x" and consists of the characters
0 -- 9 and a -- f. It is always returned lower case with even-length, but any hex
string passed into a function may be any case and may be odd-length.

:sup:`utils` . hexlify ( numberOrBigNumberOrHexStringOrArrayish ) |nbsp| :sup:`=>` |nbsp| :sup:`hex`
    Converts any number, :ref:`BigNumber <bignumber>`, hex string or
    `Arrayish`_ to a hex string. (otherwise, throws an error)

:sup:`utils` . isHexString ( value ) |nbsp| :sup:`=>` |nbsp| :sup:`boolean`
    Returns true if *value* is a valid hexstring.

:sup:`utils` . hexDataLength ( hexString ) |nbsp| :sup:`=>` |nbsp| :sup:`number`
    Returns the length (in bytes) of *hexString* if it is a valid data hexstring (even length).

:sup:`utils` . hexDataSlice ( hexString , offset [ , endOffset ] ) |nbsp| :sup:`=>` |nbsp| :sup:`hex`
    Returns a string for the subdata of *hexString* from *offset* **bytes**
    (each byte is two nibbled) to *endOffset* **bytes**. If no *endOffset* is
    specified, the result is to the end of the *hexString* is used. Each byte is two nibbles.

:sup:`utils` . hexStripZeros ( hexString ) |nbsp| :sup:`=>` |nbsp| :sup:`hex`
    Returns *hexString* with all leading zeros removed, but retaining at least
    one nibble, even if zero (e.g. ``0x0``). This may return an odd-length string.

:sup:`utils` . hexZeroPad ( hexString , length ) |nbsp| :sup:`=>` |nbsp| :sup:`hex`
    Returns *hexString* padded (on the left) with zeros to length **bytes** (each
    byte is two nibbles).

-----

Namehash
========

:sup:`utils` . namehash ( ensName ) |nbsp| :sup:`=>` |nbsp| :sup:`hex`
    Compute the namehash of *ensName*. Currently only supports the
    characters ``[a-z0-9.-]``. The concerns with fully supporting UTF-8
    are largely security releated, but `are open for discussion`_.

.. code-block:: javascript
    :caption: *examples*

    let namehash = utils.namehash('ricmoo.firefly.eth');
    // "0x0bcad17ecf260d6506c6b97768bdc2acfb6694445d27ffd3f9c1cfbee4a9bd6d"

-----

.. _signature:

Signatures
==========

There are two common formats for signatures in Ethereum. The **flat-format**, which
is a hexstring with 65 bytes (130 nibbles); or an **expanded-format**, which is an object with
the properties:

    - **r** and **s** --- the (r, s) public point of a signature
    - **recoveryParam** --- the recovery parameter of a signautre (either ``0`` or ``1``)
    - **v** --- the recovery param nomalized for Solidity (either ``27`` or ``28``)

:sup:`utils` . splitSignature ( hexStringOrArrayishOrSignature ) |nbsp| :sup:`=>` |nbsp| :sup:`Signature`
    Returns an expanded-format signature object for *hexStringOrArrayishOrSignature*.
    Passing in an signature that is already in the expanded-format will ensure
    both *recoveryParam* and *v* are populated.

:sup:`utils` . joinSignature ( signature ) |nbsp| :sup:`=>` |nbsp| :sup:`hex`
    Returns the flat-format signature hexstring of *signature*. The final *v*
    byte will always be normalized to ``0x1b`` of ``0x1c``.

.. code-block:: javascript
    :caption: *To Expanded-Format*

    // Flat-format; this is the format provided by JSON-RPC responses
    let flat = "0x0ba9770fd8778383f6d56faadc71e17b75f0d6e3ff0a408d5e6c4cee3bd70a16" +
                 "3574da0ebfb1eaac261698b057b342e52ea53f85287272cea471a4cda41e3466" +
                 "1b"
    let expanded = utils.splitSignature(flat);

    console.log(expanded);
    // {
    //    r: "0x0ba9770fd8778383f6d56faadc71e17b75f0d6e3ff0a408d5e6c4cee3bd70a16",
    //    s: "0x3574da0ebfb1eaac261698b057b342e52ea53f85287272cea471a4cda41e3466",
    //    recoveryParam: 0,
    //    v: 27
    // }

.. code-block:: javascript
    :caption: *To Flat-Format*

    // Expanded-format; this is the format Solidity and other tools often require
    let expanded = {
        r: "0x0ba9770fd8778383f6d56faadc71e17b75f0d6e3ff0a408d5e6c4cee3bd70a16",
        s: "0x3574da0ebfb1eaac261698b057b342e52ea53f85287272cea471a4cda41e3466",
        recoveryParam: 0,
        v: 27
    }
    let flat = utils.joinSignature(expanded);

    console.log(flat)
    // "0x0ba9770fd8778383f6d56faadc71e17b75f0d6e3ff0a408d5e6c4cee3bd70a16" +
    //   "3574da0ebfb1eaac261698b057b342e52ea53f85287272cea471a4cda41e3466" +
    //   "1b"


-----

.. _transactions:

Transactions
============

:sup:`utils` . serializeTransaction ( transaction [ , signature ] ) |nbsp| :sup:`=>` |nbsp| :sup:`hex`
    Serialize *transaction* as a :ref:`hex-string <hexstring>`, optionally including
    the *signature*.

    If *signature* is provided, it may be either the :ref:`Flat Format <signature>`
    or the :ref:`Expanded Format <signature>`, and the serialized transaction will
    be a signed transaction.

:sup:`utils` . parseTransaction ( rawTransaction ) |nbsp| :sup:`=>` |nbsp| :sup:`Transaction`
    Parse the serialized transaction, returning an object with the properties:

      - **to**
      - **nonce**
      - **gasPrice**
      - **gasLimit**
      - **data**
      - **value**
      - **chainId**

    If the transactions is signed, addition properties will be present:

      - **r**, **s** and **v** --- the signature public point and recoveryParam (adjusted for the chainId)
      - **from** --- the address of the account that signed the transaction
      - **hash** --- the transaction hash

-----

.. _utf8-strings:

UTF-8 Strings
=============

.. _utf8-to-bytes:

:sup:`utils` . toUtf8Bytes ( string ) |nbsp| :sup:`=>` |nbsp| :sup:`Uint8Array`
    Converts a UTF-8 string to a Uint8Array.

.. _utf8-to-string:

:sup:`utils` . toUtf8String ( hexStringOrArrayish , [ ignoreErrors :sup:`= false` ) |nbsp| :sup:`=>` |nbsp| :sup:`string`
    Converts a hex-encoded string or array to its UTF-8 representation.

.. code-block:: javascript
    :caption: *To UTF-8 Bytes*

    let text = "Hello World";

    let bytes = utils.toUtf8Bytes(text);

    console.log(bytes);
    // Uint8Array [72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100]

.. code-block:: javascript
    :caption: *To UTF-8 String*

    let array = [72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100];

    let stringFromArray = utils.toUtf8String(array)

    console.log(stringFromArray);
    // "Hello World"

    let hexString = "0x48656c6c6f20576f726c64";
    let stringFromHexString = utils.toUtf8String(hexString);

    console.log(stringFromHexString);
    // "Hello World"

-----

Web
===

:sup:`utils` . fetchJson ( urlOrInfo [ , processFunc ] ) |nbsp| :sup:`=>` |nbsp| :sup:`Promise<any>`
    Returns a :ref:`Promise <promise>` of the contents of *urlOrInfo*, processed by
    *processFunc*.

    The *urlOrInfo* may also be specified as an object with the properties:

        - **url** --- the JSON-RPC URL (required)
        - **user** --- a username to use for Basic Authentication (optional)
        - **password** --- a password to use for Basic Authentication (optional)
        - **allowInsecure** --- allow Basic Authentication over an insecure HTTP network (default: false)
        - **timeout** --- number of milliseconds to abort the request (default: 2 minutes)
        - **headers** --- additional headers to send to the server (case insensitive)

:sup:`utils` . poll ( func , [ options ] ) |nbsp| :sup:`=>` |nbsp| :sup:`Promise<any>`
    Poll using the function *func*, resolving when it does not return ``undefined``. By
    default this method will use the `exponential back-off`_ algorithm.

    The *options* is an object with the properties:

        - **timeout** --- after this many millisecconds, the promise will reject with a ``timeout`` error (default: no timeout)
        - **floor** --- minimum amount of time between polling (default: 0)
        - **ceiling** --- minimum amount of time between polling (default: 10s)
        - **interval** --- the interval to use for exponential backoff (default: 250ms)
        - **onceBlock** --- a function which takes 2 parameters, the string ``block`` and a callback *func*; polling will occur everytime *func* is called; any provider can be passed in for this property

-----


.. _are open for discussion: https://github.com/ethers-io/ethers.js/issues/42
.. _eth_sign: https://github.com/ethereum/wiki/wiki/JSON-RPC#eth_sign
.. _exponential back-off: https://en.wikipedia.org/wiki/Exponential_backoff
.. _safe range: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isSafeInteger
.. _non-standard packed mode: http://solidity.readthedocs.io/en/develop/abi-spec.html#non-standard-packed-mode

.. EOF
