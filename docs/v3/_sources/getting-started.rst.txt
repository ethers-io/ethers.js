Getting Started
***************

The ethers.js library is a compact and complete JavaScript library for Ethereum.

-----

Installing in Node.js
=====================

From your project directory::

    /Users/ricmoo/my-project> npm install --save ethers

And from the relevant application files::

    var ethers = require('ethers');


-----

Including in Web Applications
=============================

For security purposes, it is usually best to place a copy of `this script`_ on
the application's server, but for a quick prototype using the Ethers CDN (content
distribution network) should suffice::

    <!-- This exposes the library as a global variable: ethers -->
    <script src="https://cdn.ethers.io/scripts/ethers-v3.min.js"
            charset="utf-8"
            type="text/javascript">
    </script>


-----

.. _npm is installed: https://nodejs.org/en/
.. _this script: https://cdn.ethers.io/scripts/ethers-v3.0.min.js
