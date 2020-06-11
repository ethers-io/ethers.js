Providers
*********

The Ethereum eco-system provides many methods of interacting with the
blockchain. In ethers.js we expose a Provider API that covers the
breadth of operations, however often it is useful to inter-operate with
other existing APIs and libraries.

-----

MetaMask
========

The MetaMask plug-in enables Ethereum for the Chrome browser, making it
easy for people new ecosystem to get started, exposing the Ethereum
network as a standard Web3 Provider.

.. code-block:: javascript
    :caption: *Connecting to MetaMask*

    // MetaMask injects a Web3 Provider as "web3.currentProvider", so
    // we can wrap it up in the ethers.js Web3Provider, which wraps a
    // Web3 Provider and exposes the ethers.js Provider API.

    const provider = new ethers.providers.Web3Provider(web3.currentProvider);

    // There is only ever up to one account in MetaMask exposed
    const signer = provider.getSigner();

-----

TestRPC / Ganache
=================

The Ganache (formerly TestRPC) is a mock-blockchain which helps create
temporary instances of an Ethereum node for testing.

**NOTE:**
    Ganache is not entirely standards-compliant and may
    not always behave properly. If you are getting deeper
    into Ethereum development, we recommend installing
    Geth or Parity and using a development chain



.. code-block:: javascript
    :caption: *Connecting to a Ganache Node*

    // Once a Ganache node is running, it behaves very similar to a
    // JSON-RPC API node.

    const url = "http://localhost:8545";

    // Or if you are running the UI version, use this instead:
    // const url = "http://localhost:7545"

    const provider = new ethers.providers.JsonRpcProvider(url);

    // Getting the accounts
    const signer0 = provider.getSigner(0);
    const signer1 = provider.getSigner(1);

.. code-block:: javascript
    :caption: *Using an In-Process Ganache Instance*

    // If you would like to run an in-process instance of Ganache, you can
    // use a method similar to the MetaMask solution; we wrap the Web3 Provider
    // API with an ethers.js Web3Provider, which exposes the ethers.js API
    // from a Web3 Provider

    const ganache = Ganache.provider(ganacheOptions);
    const provider = new ethers.providers.Web3Provider(ganache);

    // Getting the accounts
    const signer0 = provider.getSigner(0);
    const signer1 = provider.getSigner(1);

-----

Custom Provider
===============

This is a much more advanced topic, and most people should not need to work this
low level. But it is provided for those rare instances where you need some custom
connection logic.

A provider must only implement the method **perform(method, params)**. All data passed
into a provider is sanitized by the BaseProvider subclass, and all results are normalized
before returning them to the user.

For this example, we will build a DebugProvider, which will simple proxy all commands
through another Provider, but dump all data going back and forth.

.. code-block:: javascript
    :caption: *Sub-Class Provider for Debugging*

    const ethers = require('ethers');

    class DebugProvider extends ethers.providers.BaseProvider {
        readonly provider: ethers.providers.Provider;

        constructor(provider) {
            super(provider.getNetork());
            this.provider = provider;
        }

        // This should return a Promise (and may throw erros)
        // method is the method name (e.g. getBalance) and params is an
        // object with normalized values passed in, depending on the method
        perform(method, params): Promise<any> {
            this.provider.perform(method, params).then((result) => {
                console.log('DEBUG', method, params, '=>', result);
            }, (error) => {
                console.log('DEBUG:ERROR', method, params, '=>', error);
                throw error;
            });
        }
    }

-----

.. EOF
