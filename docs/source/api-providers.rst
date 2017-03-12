Providers API
*************

A provider is a service running 
What is a provider?

-----

Connecting to a Provider
========================

providers.EtherscanProvider( [ testnet ] [ , apiToken ] )
    Connect to the `Etherscan`_ blockchain API service.

providers.JsonRpcProvider( [ url ] [ , testnet ] [, chainId ] )
    Connect to the `JSON-RPC API`_ of an Ethereum node, such as `Parity`_ or `Geth`_.

providers.InfuraProvider( [ testnet ] [ , apiAccessToken ] )
    Connect to the `INFURA`_ hosted network of Ethereum nodes.

providers.FallbackProvider( providers )
    Attempts each provider in turn, falling back to the next in the list if an
    error was encountered.

providers.getDefaultProvider( [ testnet ] )
    This automatically creates a FallbackProvider backed by INFURA and Etehrscan.

*Example:* ::

    var providers = require('ethers').providers;

    var testnet = true;

    var infuraProvider = new providers.InfuraProvider(testnet);
    var etherscanProvider = new providersInfuraProvider(testnet);
    var fallbackProvider = new providers.FallbackProvider([
        infuraProvider,
        etherscanProvider
    ]);

    // This is equivalent to using the getDefaultProvider
    var provider = providers.getDefaultProvider(testnet)

-----

.. _provider:

Provider
========

:sup:`prototype` . testnet
    blah

:sup:`prototype` . chainId
    blah

FallbackProvider
----------------

:sup:`prototype` . providers
    Returns a copy of the array of providers.

JsonRpcProvider
---------------

:sup:`prototype` . url
    blah

EtherscanProvider
-----------------

:sup:`prototype` . apiToken
    blah

InfuraProvider
--------------

:sup:`prototype` . apiAccessToken
    blah

-----

Account Actions
===============

provider.getBalance( address [ , blockHeightOrTag ] )
-----------------------------------------------------

provider.getTransactionCount( address [ , blockHeightOrTag ] )
--------------------------------------------------------------

provider.sendTransaction( signedTransaction )
---------------------------------------------

fof

-----

Blockchain Status
=================

provider.getBlockNumber()
-------------------------

provider.getGasPrice()
----------------------

provider.getBlock( blockHashOrBlockNumber )
-------------------------------------------

provider.getTransaction( transactionHash )
------------------------------------------

provider.getTransactionReceipt( transactionHash )
-------------------------------------------------

bar

-----

Contract Execution
==================

provider.call( transaction )
----------------------------

provider.estimateGas( transaction )
-----------------------------------

foobar

-----

Contract State
==============

provider.getCode( address )
---------------------------

provider.getStorageAt( address, position [ , blockTag ] )
---------------------------------------------------------

provider.getLogs( filter )
--------------------------

foobar

-----

Events
======


provider.on( eventValue, callback )
provider.once( eventVaue, callback)

Event type can be any of:

"block"
    Whenever a new block is mined, the callback till be called with the block number

transaction hash
    When the coresponding transaction is mined, the callback will be called

array of topics
    When any of the topics is present in the logs, the callback will be calls

provider.removeListener( eventName, callback )

provider.removeAllListeners( eventName )

provider.listenerCount( [ eventName ] )

*Example:* ::

    // Get notified on every new block
    provider.on('block', function(blockNumber) {
        console.log('New Block: ' + blockNumber);
    });


    // Get notified when a transaction is mined
    provider.once(transactionHash, function(transction) {
        console.log('Transaction Minded: ' + transaction.hash);
        console.log(transaction);
    );

    // OR equivalently the waitForTransaction() returns a Promise

    provider.waitForTransaction(transactionHash).then(function(transaction) {
        console.log('Transaction Minded: ' + transaction.hash);
        console.log(transaction);
    });


    // Get notified when a contract event is logged
    provider.on([ eventTopic ], function(log) {
        console.log('Event Log');
        console.log(log);
    });

-----

Objects
=======

.. _blocktag:

Block Tag
---------

A block tag is used to uniquely identify a block's position in th blockchain.
Several operations allow you to specify this.

Number or hex string
    Each block has a block number

"latest"
    The most recently mined block

"pending"
    The block that is currently being mined

Transaction
-----------

.. _filter:

Filter
------

foobar

-----

Provider Specific Extra API Calls
=================================

etherscanProvider.getTransactions('address')
----------------------------------------------

etherscanProvider.getEtherPrice()
-----------------------------------

Hello

-----

.. _Etherscan: https://etherscan.io/apis
.. _INFURA: https://infura.io
.. _Parity: https://ethcore.io/parity.html
.. _Geth: https://geth.ethereum.org
.. _JSON-RPC API: https://github.com/ethereum/wiki/wiki/JSON-RPC
