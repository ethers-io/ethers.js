Getting Started
***************

The Ethers library aims to be:

* Complete
* Compact
* Correct

-----

Installing in Node.js
=====================

Assuming `npm is installed`_, from the project directory ``ethers.js`` can be added using::

    /Users/ricmoo/my-project> npm install --save ethers

And from the relevant application files::

    var ethers = require('ethers');


-----

Including in Web Applications
=============================

For security purposes, it is usually best to place a copy of this script on
the application's server, but for a quick prototype using the Ethers CDN (content
distribution network) should suffice::

    <!-- This exposes the library as a global variable: ethers -->
    <script src="https://cdn.ethers.io/scripts/ethers.v2.0.js" type="text/javascript"></script>


.. _npm is installed: https://nodejs.org/en/

-----

\ 
