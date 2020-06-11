Utilities
*********

The utility functions exposed in both the *ethers* umbrella package and the *ethers-utils*::

    var utils = require('ethers').utils;


-----

.. _bignumber:

Big Numbers
===========

A BigNumber is an immutable object which allow math operations to be carried
out on numbers far larger than :ref:`JavaScript can accurately handle <ieee754>`.
Many functions return these, so it is important to understand how to work with these.

:sup:`prototype` . add ( otherValue )
    Return a new BigNumber of this plus *otherValue*

:sup:`prototype` . sub ( otherValue )
    Return a new BigNumber of this minus *otherValue*

:sup:`prototype` . mul ( otherValue )
    Return a new BigNumber of this times *otherValue*

:sup:`prototype` . div ( otherValue )
    Return a new BigNumber of this divided by *otherValue*

:sup:`prototype` . mod ( otherValue )
    Return a new BigNumber of this modulo *otherValue*

:sup:`prototype` . eq ( otherValue )
    Return true if this is equal to *otherValue*

:sup:`prototype` . lt ( otherValue )
    Return true if this is less than *otherValue*

:sup:`prototype` . lte ( otherValue )
    Return true if this is less or equal to *otherValue*

:sup:`prototype` . gt ( otherValue )
    Return true if this is greater than *otherValue*

:sup:`prototype` . gte ( otherValue )
    Return true if this is greater than or equal to *otherValue*

:sup:`prototype` . isZero ( )
    Return true if this is equal to zero

:sup:`prototype` . toNumber ( )
    Return a JavaScript number representation; an error is thrown if the value is
    outside the safe range for JavaScript IEEE 754 64-bit floating point numbers

:sup:`prototype` . toString ()
    Return a decimal string representation

:sup:`prototype` . toHexString ( )
    Return a **0x prefixed** hexidecimal representation


Creating Instances
------------------

:sup:`utils` **. bigNumberify** ( value )
    Returns a BigNumber instance of *value*. The *value* may be anything which can be
    reliably converted into a BigNumber:

    *Decimal String*
      A string consisting of the decimal digits 0 through 9, optionally with a leading
      negative sign.

      **examples:** utils.bigNumberify("42")

    *Hex String*
        A :ref:`hex string <hexstring>`, witch has aa **prefix of 0x** and consisting
        of the hexidecimal digits 0 through 9 and a through f, case-insensitive. Must
        be non-negative.

        **examples:** utils.bigNumberify("0x2a")

    *JavaScript Numbers*
        Numbers must be within the `safe range`_ for JavaScript.

        **examples:** utils.bigNumberify(42)

    *Arrayish*
        Treats the :ref:`arrayish <api-arrayish>` as a big-endian encoded bytes representation.

        **examples:** utils.bigNumberify([ 42 ])

    *BigNumber*
        Returns *value*, since a BigNumber is immutable.

.. _safe range: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isSafeInteger

*Examples*
----------

::

    var utils = require('ethers').utils;
    var gasPriceWei = utils.bigNumberify("20902747399");
    var gasLimit = utils.bigNumberify(3000000);

    var maxCostWei = gasPriceWei.mul(gasLimit)
    console.log("Max Cost: " + maxCostWei.toString());
    // "Max Cost: 62708242197000000"

    console.log("Number: " + maxCostWei.toNumber());
    // throws an Error, the value is too large for JavaScript to handle safely

-----


Ether Strings and Wei
=====================

:sup:`utils` . etherSymbol
    The ethereum symbol (the Greek letter *Xi* )

.. _parseEther:

:sup:`utils` . parseEther ( etherString )
    Parse the *etherString* representation of ether into a BigNumber instance
    of the amount of wei.

.. _formatEther:

:sup:`utils` . formatEther ( wei [ , options ] )
    Format an amount of *wei* into a decimal string representing the amount of ether. The
    *options* object supports the keys ``commify`` and ``pad``. The output will always
    include at least one whole number and at least one decimal place.

.. _parseUnits:

:sup:`utils` . parseUnits ( valueString , decimalsOrUnitName )
    Parse the *valueString* representation of units into a BigNumber instance
    of the amount of wei. The *decimalsOrUnitsName* may be a number of decimals between
    3 and 18 (multiple of 3) or a name, such as `gwei`.

.. _formatUnits:

:sup:`utils` . formatUnits ( wei , decimalsOrUnitName [ , options ] )
    Format an amount of *wei* into a decimal string representing the amount of units. The
    *options* object supports the keys ``commify`` and ``pad``. The output will always
    include at least one whole number and at least one decimal place. The *decimalsOrUnitsName*
    may be a number of decimals between 3 and 18 (multiple of 3) or a name, such as `gwei`.


*Examples*
----------

::

    var utils = require('ethers').utils;
    var wei = utils.parseEther('1000.0');
    console.log(wei.toString(10));
    // "1000000000000000000000"

    console.log(utils.formatEther(0));
    // "0.0"

    var wei = utils.bigNumberify("1000000000000000000000");

    console.log(utils.formatEther(wei));
    // "1000.0"

    console.log(utils.formatEther(wei, {commify: true}));
    // "1,000.0"

    console.log(utils.formatEther(wei, {pad: true}));
    // "1000.000000000000000000"       (18 decimal places)

    console.log(utils.formatEther(wei, {commify: true, pad: true}));
    // "1,000.000000000000000000"      (18 decimal places)


-----

Addresses
=========

There are :ref:`several formats <checksum-address>` available on the Ethereum network for
addresses, and it is often useful to be able to convert between them.


.. _api-getAddress:

:sup:`utils` . getAddress ( address [ , generateIcap ] )
    Normalize an address to a :ref:`checksum address <checksum-address>`, or as an
    :ref:`ICAP <icap-address>` address if *generateIcap* is true.

*Examples*
----------

::

    var utils = require('ethers').utils;
    var address = "0xd115bffabbdd893a6f7cea402e7338643ced44a6";
    var icapAddress = "XE93OF8SR0OWI6F4FO88KWO4UNNGG1FEBHI";

    console.log(utils.getAddress(address));
    // "0xD115BFFAbbdd893A6f7ceA402e7338643Ced44a6"

    console.log(utils.getAddress(icapAddress));
    // "0xD115BFFAbbdd893A6f7ceA402e7338643Ced44a6"

    console.log(utils.getAddress(address, true));
    // "XE93OF8SR0OWI6F4FO88KWO4UNNGG1FEBHI"

    console.log(utils.getAddress(icapAddress, true));
    // "XE93OF8SR0OWI6F4FO88KWO4UNNGG1FEBHI"


-----

.. _api-utf8-strings:

UTF-8 Strings
=============

.. _api-utf8-to-bytes:

:sup:`utils` . toUtf8Bytes ( string )
    Converts a UTF-8 string to a Uint8Array.

.. _api-utf8-to-string:

:sup:`utils` . toUtf8String ( hexStringOrArrayish )
    Converts a hex-encoded string or array to its UTF-8 representation.

*Examples*
----------

::

    var utils = require('ethers').utils;
    var text = "Hello World";

    var bytes = utils.toUtf8Bytes(text);
    console.log(bytes);
    // Uint8Array [72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100]

    console.log(utils.toUtf8String(bytes));
    // "Hello World"

    var hexString = "0x48656c6c6f20576f726c64";
    console.log(utils.toUtf8String(hexString));
    // "Hello World"


-----

.. _api-utils-crypto:

Cryptographic Functions
=======================

:sup:`utils` . keccak256 ( hexStringOrArrayish )
    Compute the keccak256 cryptographic hash of a value, returned as a hex string. (Note:
    often Ethereum refers to this, **incorrectly**, as SHA3)

:sup:`utils` . id ( utf8String )
    Compute the keccak256 cryptographic hash of a UTF-8 string, returned as a hex string.

:sup:`utils` . sha256 ( hexStringOrArrayish )
    Compute the SHA2-256 cryptographic hash of a value, returned as a hex string.

:sup:`utils` . randomBytes ( length )
    Return a Uint8Array of cryptographically secure random bytes

*Examples*
----------

**Hashing Binary Data** ::

    var utils = require('ethers').utils;
    console.log(utils.keccak256([ 0x42 ]));
    // '0x1f675bff07515f5df96737194ea945c36c41e7b4fcef307b7cd4d0e602a69111'

    console.log(utils.keccak256("0x42"));
    // '0x1f675bff07515f5df96737194ea945c36c41e7b4fcef307b7cd4d0e602a69111'


    console.log(utils.sha256([ 0x42 ]));
    // '0xdf7e70e5021544f4834bbee64a9e3789febc4be81470df629cad6ddb03320a5c'

    console.log(utils.sha256("0x42"));
    // '0xdf7e70e5021544f4834bbee64a9e3789febc4be81470df629cad6ddb03320a5c'


**Hashing UTF-8 Strings** ::

    var utils = require('ethers').utils;
    // Convert the string to binary data
    var utf8Bytes = utils.toUtf8Bytes('Hello World');

    console.log(utils.keccak256(utf8Bytes));
    // '0x592fa743889fc7f92ac2a37bb1f5ba1daf2a5c84741ca0e0061d243a2e6707ba'

    console.log(utils.sha256(utf8Bytes));
    // '0xa591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e'


    console.log(utils.id("Hello World"));
    // '0x592fa743889fc7f92ac2a37bb1f5ba1daf2a5c84741ca0e0061d243a2e6707ba'

    console.log(utils.id("addr(bytes32)"));
    // '0x3b3b57de213591bb50e06975ea011e4c8c4b3e6de4009450c1a9e55f66e4bfa4'


**Random Bytes** ::

    var utils = require('ethers').utils;
    console.log(utils.randomBytes(3));
    // Uint8Array [ 194, 22, 140 ]


-----

Solidity Cryptographic Functions
================================

Solidity uses a `non-standard packed mode`_ to encode parameters that are passed
into its hashing functions. The parameter types and values can be used to compute
the result of the hash functions as would be performed by Solidity.

:sup:`utils` . solidityKeccak256 ( types, values )
    Compute the keccak256 cryptographic hash using the Solidity non-standard (tightly)
    packed data for *values* given the *types*.

:sup:`utils` . soliditySha256 ( types, values )
    Compute the SHA256 cryptographic hash using the Solidity non-standard (tightly)
    packed data for *values* given the *types*.

:sup:`utils` . solidityPack ( types, values )
    Compute the Solidity non-standard (tightly) packed data for *values* given the *types*.


*Examples*
----------

::

    var utils = require('ethers').utils;
    var result = utils.solidityKeccak256([ 'int8', 'bytes1', 'string' ], [ -1, '0x42', 'hello' ]);
    console.log(result);
    // '0x52d7e6a62ca667228365be2143375d0a2a92a3bd4325dd571609dfdc7026686e'

    result = utils.soliditySha256([ 'int8', 'bytes1', 'string' ], [ -1, '0x42', 'hello' ]);
    console.log(result);
    // '0x1eaebba7999af2691d823bf0c817e635bbe7e89ec7ed32a11e00ca94e86cbf37'

    result = utils.solidityPack([ 'int8', 'bytes1', 'string' ], [ -1, '0x42', 'hello' ]);
    console.log(result);
    // '0xff4268656c6c6f'

-----

.. _api-arrayish:

Arrayish
========

An arrayish object is any such that it:

* has a *length* property
* has a value for each index from 0 up to (but excluding) *length*
* has a valid byte for each value; a byte is an integer in the range [0, 255]
* is **NOT** a string

:sup:`utils` . isArrayish ( object )
    Returns true if *object* can be treated as an arrayish object.

:sup:`utils` . arrayify ( hexStringOrBigNumberOrArrayish )
    Returns a Uint8Array of a hex string, BigNumber or of an `Arrayish`_ object.

:sup:`utils` . concat ( arrayOfHexStringsAndArrayish )
    Return a Uint8Array of all *arrayOfHexStringsAndArrayish* concatenated.

:sup:`utils` . padZeros ( typedUint8Array, length )
    Return a Uint8Array of *typedUint8Array* with zeros prepended to *length* bytes.

:sup:`utils` . stripZeros ( hexStringOrArrayish )
    Returns a Uint8Array with all leading zero **bytes** striped.

-----

.. _hexstring:

Hex Strings
===========

A hex string is **always** prefixed with "0x" and consists of the characters
0 -- 9 and a -- f. It is always returned lower case with even-length, but any hex
string passed into a function may be any case and may be odd-length.


:sup:`utils` . hexlify ( numberOrBigNumberOrHexStringOrArrayish )
    Converts any number, :ref:`BigNumber <bignumber>`, hex string or
    `Arrayish`_ to a hex string. (otherwise, throws an error)

-----

Contract Addresses
==================

Every contract deployed on the Ethereum network requires an address (you can think
of this as the memory address which the running application lives at). The address
is generated from a cryptographic hash of the address of the creator and the nonce
of the transaction.

:sup:`utils` . getContractAddress ( transaction )
    Computes the contract address a contract would have if this transaction
    created a contract. (transaction requires only ``from`` and ``nonce`` be
    defined)

*Examples*
----------

::

    var utils = require('ethers').utils;
    // Ropsten: 0x5bdfd14fcc917abc2f02a30721d152a6f147f09e8cbaad4e0d5405d646c5c3e1
    var transaction = {
        from: '0xc6af6e1a78a6752c7f8cd63877eb789a2adb776c',
        nonce: 0
    };

    console.log(utils.getContractAddress(transaction));
    // "0x0CcCC7507aEDf9FEaF8C8D731421746e16b4d39D"

-----

.. _non-standard packed mode: http://solidity.readthedocs.io/en/develop/abi-spec.html#non-standard-packed-mode

.. EOF
