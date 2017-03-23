Notes
*****

Hello

-----

.. _ieee754:

Why can't I just use numbers?
=============================

The first problem many encounter when dealing with Ethereum is the concept of numbers. Most
common currencies are broken down with very little granulairty. For example, there are only
100 cents in a single dollar. However, there are  10\ :sup:`18` **wei** in a single
**ether**.

JavaScript uses `IEEE 754 double-precision binary floating point`_ numbers to represent
numeric values. As a result, there are *holes* in the integer set after
9,007,199,254,740,991; which is problematic for *Ethereum* because that is only
around 0.009 ether (in wei).

To demonstrate how this may be an issue in your code, cosider::

    > (Number.MAX_SAFE_INTEGER + 4 - 5) == (Number.MAX_SAFE_INTEGER - 1)
    false


To remedy this, all numbers (which can be large) in *ethers.js* are stored and manipulated
as Big Numbers (i.e. `BN.js`_).

The functions :ref:`parseEther( etherString ) <parseEther>` and :ref:`formatEther( wei ) <formatEther>` can be used to convert between
string representations, which are displayed to or entered by the user and Big Number representations
which can have mathematical operations handeled safely.

-----

.. _promise:

Promises
========

Hello

-----

.. _checksum-address:

Checksum Address
================

A `checksum address`_ uses mixed case hexidecimal strings to encode the checksum
information in the capitalization of the alphabetic characters, while remaining
backwards compatible with non-checksum addresses.

Example::

    // Valid; checksum (mixed case)
    0xCd2a3d9f938e13Cd947eC05ABC7fe734df8DD826

    // Valid; NO checksum (no mixed case)
    0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826
    0xCD2A3D9F938E13CD947EC05ABC7FE734DF8DD826

    // INVALID; (mixed case, but case differs from first example)
    0xDc2a3d9f938e13cd947ec05abc7fe734df8dd826
      ^^

To convert between ICAP and checksum addresses, see :ref:`getAddress() <api-getAddress>`.

.. _checksum address: https://github.com/ethereum/EIPs/issues/55


-----

.. _icap-address:

ICAP Address
============

The original method of adding a checksum to an Ethereum address was by using the
a format compatible with `IBAN`_ addresses, using the country code **XE**. However,
only addresses which have 0 as the first byte (i.e. the address begins with 0x00)
are truely compatible with IBAN, so ICAP extends the definition to allow for 31
alphanumeric characters (instead of the standard 30).

An ICAP address has the following format::

    XE [2 digit checksum] [up to 31 alphanumeric characters]

To convert between ICAP and checksum addresses, see :ref:`getAddress() <api-getAddress>`.

-----

.. _IBAN: https://en.wikipedia.org/wiki/International_Bank_Account_Number
.. _IEEE 754 double-precision binary floating point: https://en.wikipedia.org/wiki/Double-precision_floating-point_format
.. _BN.js: https://github.com/indutny/bn.js/

