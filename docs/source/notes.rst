Notes
*****

A few quick notes about some of the less obvious aspects of interacting with
Ethereum in JavaScript.

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


To remedy this, all numbers (which can be large) are stored and manipulated
as :ref:`Big Numbers <bignumber>`.

The functions :ref:`parseEther( etherString ) <parseEther>` and :ref:`formatEther( wei ) <formatEther>` can be used to convert between
string representations, which are displayed to or entered by the user and Big Number representations
which can have mathematical operations handeled safely.

-----

.. _promise:

Promises
========

A `Promise in JavaScript`_ is an object which simplifies many aspects of dealing with
asynchronous functions.

It allows a pending result to be treated in many ways as if it has already been resolved.

The most useful operations you will need are:

:sup:`Promise` . all ( promises )
    Returns a new promise that resolves once all the *promises* have resolved.

:sup:`prototype` . then ( onResolve, onReject )
    Returns another Promise, which once the Promise was resolved, the *onResolve*
    function will be executed and if an error occurs, *onReject* will be called.

    If *onResolve* returns a Promise, it will be inserted into the chain of the returned
    promise. If *onResolve* throws an Error, the returned Promise will reject.

**Examples**
------------

**Cleaning out an account**

::

    var targetAddress = "0x02F024e0882B310c6734703AB9066EdD3a10C6e0";

    var privateKey = "0x0123456789012345678901234567890123456789012345678901234567890123";
    var wallet = new ethers.Wallet(privateKey);

    // Promises we are interested in
    var balancePromise = provider.getBalance(wallet.address);
    var gasPricePromise = provider.getGasPrice();
    var transactionCountPromise = provider.getCode(wallet.address);

    var allPromise = Promsie.all([
        gasPricePromise,
        balancePromise,
        transactionCountPromise
    ]);

    var sendPromise = allPromises.then(function(results) {
         // This function is ONLY called once ALL promises are fulfilled

         var gasPrice = results[0];
         var balance = results[1];
         var transactionCount = results[2];

         // Sending a transaction to an externally owned account (EOA) is 21000 gas)
         var txFeeInWei = gasPrice.mul(21000);

         // This will send the maximum amount (our balance minus the fee)
         var value = balance.sub(txFeeInWei);

         var transaction = {
             to: targetAddress,
             gasPrice: gasPrice,
             nonce: transactionCount,

             // The amount to send
             value: value,

             // Prevent replay attacks across networks
             chainId: provider.chainId,
         };

         var signedTransaction = wallet.sign(transaction);

         // By returning a Promise, the sendPromise will resolve once the
         // transaction is sent
         return provider.sendTransaction(signedTransaction);
    });

    var minedPromise = sendPromise.then(function(transaction) {
        // This will be called once the transaction is sent

        // This promise will be resolve once the transaction has been mined.
        return provider.waitForTransaction(transaction.hash);
    });

    minedPromise.then(function(transaction) {
        console.log("The transaction was mined: Block " + transaction.blockNumber);
    });


    // Promises can be re-used for their value; it will not make the external
    // call again, and will provide the exact same result every time.
    balancePromise.then(function(balance) {
        // This *may* return before teh above allPromises, since it only
        // required one external call. Keep in mind asynchronous calls can
        // be called out of order.
        console.log(balance);
    });

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
.. _Promise in JavaScript: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise

.. EOF
