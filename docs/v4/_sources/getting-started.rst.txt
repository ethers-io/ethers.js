Getting Started
***************

The ethers.js library is a compact and complete JavaScript library for Ethereum.

-----

Installing in Node.js
=====================

Install the ethers.js library from your project directory::

    /home/ricmoo/my-project> npm install --save ethers

Importing
---------

.. code-block:: javascript
    :caption: *JavaScript (ES3)*

    var ethers = require('ethers');

.. code-block:: javascript
    :caption: *JavaScript (ES5 or ES6)*

    const ethers = require('ethers');

.. code-block:: javascript
    :caption: *JavaScript (ES6) / TypeScript*

    import { ethers } from 'ethers';


-----

Including in Web Applications
=============================

For security purposes, it is usually best to place a **copy** of `this script`_ on
the application's server, but for a quick prototype using the Ethers CDN (content
distribution network) should suffice.

.. code-block:: html
    :caption: *HTML*

    <!-- This exposes the library as a global variable: ethers -->
    <script src="https://cdn.ethers.io/scripts/ethers-v4.min.js"
            charset="utf-8"
            type="text/javascript">
    </script>


-----

.. _npm is installed: https://nodejs.org/en/
.. _this script: https://cdn.ethers.io/scripts/ethers-v4.min.js
