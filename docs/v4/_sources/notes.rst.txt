Notes
*****

A few quick notes about some of the less obvious aspects of interacting with
Ethereum in JavaScript.

-----

.. _ieee754:

Why can't I just use numbers?
=============================

The first problem many encounter when dealing with Ethereum is the concept of numbers. Most
common currencies are broken down with very little granularity. For example, there are only
100 cents in a single dollar. However, there are  10\ :sup:`18` **wei** in a single
**ether**.

JavaScript uses `IEEE 754 double-precision binary floating point`_ numbers to represent
numeric values. As a result, there are *holes* in the integer set after
9,007,199,254,740,991; which is problematic for *Ethereum* because that is only
around 0.009 ether (in wei).

To demonstrate how this may be an issue in your code, consider::

    > (Number.MAX_SAFE_INTEGER + 4 - 5) == (Number.MAX_SAFE_INTEGER - 1)
    false


To remedy this, all numbers (which can be large) are stored and manipulated
as :ref:`Big Numbers <bignumber>`.

The functions :ref:`parseEther( etherString ) <parseEther>` and :ref:`formatEther( wei ) <formatEther>` can be used to convert between
string representations, which are displayed to or entered by the user and Big Number representations
which can have mathematical operations handled safely.

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

.. code-block:: javascript
    :caption: *Cleaning out an account*

    var ethers = require('ethers');
    var targetAddress = "0x02F024e0882B310c6734703AB9066EdD3a10C6e0";

    var privateKey = "0x0123456789012345678901234567890123456789012345678901234567890123";
    var wallet = new ethers.Wallet(privateKey);

    // Promises we are interested in
    var provider = ethers.getDefaultProvider('ropsten');
    var balancePromise = provider.getBalance(wallet.address);
    var gasPricePromise = provider.getGasPrice();
    var transactionCountPromise = provider.getTransactionCount(wallet.address);

    var allPromises = Promise.all([
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
             gasLimit: 21000,
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
        return provider.waitForTransaction(transaction);
    });

    minedPromise.then(function(transaction) {
        console.log("The transaction was mined: Block " + transaction.blockNumber);
    });


    // Promises can be re-used for their value; it will not make the external
    // call again, and will provide the exact same result every time.
    balancePromise.then(function(balance) {
        // This *may* return before the above allPromises, since it only
        // required one external call. Keep in mind asynchronous calls can
        // be called out of order.
        console.log(balance);
    });

-----

.. _checksum-address:

Checksum Address
================

A `checksum address`_ uses mixed case hexadecimal strings to encode the checksum
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

To convert to a checksum addresses, see :ref:`getAddress() <utils-getaddress>`.

.. _checksum address: https://eips.ethereum.org/EIPS/eip-55

-----

.. _icap-address:

ICAP Address
============

The original method of adding a checksum to an Ethereum address was by using the
a format compatible with `IBAN`_ addresses, using the country code **XE**. However,
only addresses which have 0 as the first byte (i.e. the address begins with 0x00)
are truly compatible with IBAN, so ICAP extends the definition to allow for 31
alphanumeric characters (instead of the standard 30).

An ICAP address has the following format::

    XE [2 digit checksum] [up to 31 alphanumeric characters]

To convert to an ICAP addresses, see :ref:`getIcapAddress() <utils-getaddress>`.

-----

Supported Platforms
===================

The ethers.js library aims to be as inclusive as possible. People often ask, "why
don't you use feature X or syntax Y", to which the response is usually that it
begins to heavily restricts the potential user-base.

The current target for ethers.js is to support an environment which is close to ES3,
with the addition of Object.defineProperty, which is a bit more advanced than an old
ES3 environment, but which adds considerable safety and security to the library.

The phantomjs test harness (``npm run test-phantomjs``) has a handful of shims included
in the tests/test.html, but serves as a good benchmark for what minimum features as
supported.

Currently the Test Suite runs against:

- node 6
- node 8
- node 10
- phantomjs

Another supported aspect is the use of paths in ``require``. A small part of the
library may be included, for example, ``keccak256``, by using::

    var keccak256 = require('ethers/utils/keccak256').keccak256;

Which means renaming files is a breaking change, and may only be done between
major version releases. This is useful for people using older, pre-ES6
tree-shaking, to keep their package sizes small.

Now that the library also supports TypeScript, another question that often comes
up is (for example) "why are you doing runtime checks that a value is a number,
the TypeScript compiler checks that for you". It is important to keep in mind that
TypeScript, while a useful tool, is not the tool that everyone uses, and so for
anyone using JavaScript sans TypeScript, the library should guarantee safety and
correctness for them too and fail early and fail loud if anything is out of the
ordinary.

-----

Contributing
============

I fully welcome anyone to contribute to the project, and appreciate all the
help I can get. That said, if you have ideas for a PR, please discuss them
as an issue on GitHub first.

A few notes on contributing.

- Please read the above section on Supported Platforms.
- An important feature of ethers.js is that it is small, which means uncommon features or large features need a great deal of discussion.
- Since ethers.js is designed to be extensible, there are often ways to add optional packages; for example, look at the BIP39 mnemonic wordlists, which are not bundled into the browser version, but are designed to be seamlessly loaded into the browser if their functionality is required.
- Dependencies; part A) in line with the above, "keep things small", adding a dependency is a big deal, as they often bring many other packages with them. A great deal of effort has been used to tune the build process and dependency list to keep things tight
- Dependencies; part B) adding additional third party libraries, adds a huge attack vector fun malicious code or unexpected consequences, so adding a dependency is certainly something that needs to be very convincingly argued.
- Dependencies; part C) part B applies to dev dependencies too. A devDependency can inject or otherwise do strange things and increases the attack vector for bugs and malicious code
- Changing filenames or breaking backwards compatibility is a no-go for minor version changes
- Major version changes do not happen often. We place @TODO in the source code for things that will be updated at the next version change.
- Please use the GitHub issue system to make requests, or discuss changes you would like to make.
- Testing is a must. It should generally take you longer to write test cases than it does the actual code.
- All test cases must pass on all platforms supported on Travis CI.

-----

Security
========

A lot of people store a lot of value in Ethereum and the code that runs it. As
such, security is important.


The GitHub and NPM Package
--------------------------

The keys used to sign code on GitHub are well protected, but anyones computer
can be compromised.

All services involved have two-factor authentication set up, but please keep in
mind that bleeding-edge technology should probably not be used in production
environments.

Keep in mind, however, that at the end of the day, if NPM were hacked, anything
in the system could be replaced.

By using a version that is perhaps a few weeks old, providing there are no
advisories otherwise, there has been adequate time for any compromise to have
been broadcast.

Also, one of the test cases verifies the deterministic build on `Travis CI`_. **Never**
install a version which has failed the Continuous Integration tests on Travis CI.

Long story short, be careful.

In the event of any significant issue, it will be posted on the README.md file,
have an issue posted, with ALL CAPS in the title and will be broadcast on the
@ethersproject twitter.


Memory Hard Brute-Force Encrpyting
----------------------------------

A topic that often comes up is the poor performance of decrypting Wallet.

While it may not be immediately obvious, this is intentional for security
purposes.

If it takes the legitimate user, who knows the password 5 seconds or so to
unlock their account, that means that an attacker must spend 5 seconds per
password attempt, so to guess a million passwords, requires 5 million
seconds. Client software can streamline the process by using Secure Enclaves
or other secure local places to store the decrypted wallet to improve the
customer experience past the first decryption.


Responsible Disclosure
----------------------

If you find a critical bug or security issue with ethers.js, please contact
support@ethers.io so that we can address it before you make it public.
You will receive credit for the discovery after it is fixed and announced. :)

-----

.. _IBAN: https://en.wikipedia.org/wiki/International_Bank_Account_Number
.. _IEEE 754 double-precision binary floating point: https://en.wikipedia.org/wiki/Double-precision_floating-point_format
.. _BN.js: https://github.com/indutny/bn.js/
.. _Promise in JavaScript: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
.. _Travis CI: https://travis-ci.org/ethers-io/ethers.js

.. EOF
