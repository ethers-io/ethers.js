.. _api-provider:

Providers API
*************

A Provider abstracts a connection to the Ethereum blockchain, for issuing queries
and sending state changing transactions.

Unlike the Web3 provider, there is no concept of accounts or signing entities in
an Ethers Provider. It is simply a connection to the network, and cannot unlock
accounts or sign and is unaware of your Ethereum addresses.

To manage state changing operations, you must use a :ref:`Wallet <api-wallet>`
to sign transactions. If you pass a wallet in as a signer to
a :ref:`Contract <api-contract>`, this is managed for you by the contract.


-----


Connecting to Ethereum
======================

There are several ways to connect to the Ethereum blockchain:

new :sup:`ethers . providers` . EtherscanProvider( [ network ] [ , apiToken ] )
    Connect to the `Etherscan`_ blockchain `web service API`_.

    **default:** *network*\ ='homestead', *apiToken*\ =null

new :sup:`ethers . providers` . JsonRpcProvider( [ url ] [ , network ] )
    Connect to the `JSON-RPC API`_ *url* of an Ethereum node, such as `Parity`_ or `Geth`_.

    **default:** *url*\ ="http://localhost:8545/", *network*\ ='homestead'

new :sup:`ethers . providers` . InfuraProvider( [ network ] [ , apiAccessToken ] )
    Connect to the `INFURA`_ hosted network of Ethereum nodes.

    **default:** *network*\ ='homestead', *apiAccessToken*\ =null

new :sup:`ethers . providers` . Web3Provider( web3Provider [ , network ] )
    Connect to an existing Web3 provider (e.g. `web3Instance.currentProvider`).

    **default:** *network*\ ='homestead'

new :sup:`ethers . providers` . FallbackProvider( providers )
    Improves reliability by attempting each provider in turn, falling back to the
    next in the list if an error was encountered.

:sup:`ethers . providers` . getDefaultProvider( [ network ] )
    This automatically creates a FallbackProvider backed by INFURA and Etherscan; recommended

    **default:** *network*\ ='homestead'


*Examples*
----------

::

    var providers = require('ethers').providers;

    // Connect to Ropsten (the test network)

    // You may specify any of:
    // - boolean; true = ropsten, false = homestead
    // - object; { name: 'ropsten', chainId: 3 } (see ethers.networks);
    // - string; e.g. 'homestead', 'ropsten', 'rinkeby', 'kovan'
    var network = providers.networks.ropsten;

    // Connect to INFUA
    var infuraProvider = new providers.InfuraProvider(network);

    // Connect to Etherscan
    var etherscanProvider = new providers.EtherscanProvider(network);

    // Creating a provider to automatically fallback onto Etherscan
    // if INFURA is down
    var fallbackProvider = new providers.FallbackProvider([
        infuraProvider,
        etherscanProvider
    ]);

    // This is equivalent to using the getDefaultProvider
    var provider = providers.getDefaultProvider(network)

    // Connect to a local Parity instance
    var provider = new providers.JsonRpcProvider('http://localhost:8545', network);

    // Connect to an injected Web3's provider (e.g. MetaMask)
    var web3Provider = new providers.Web3Provider(web3.currentProvider, network);


-----

Prototype
=========

All properties are immutable, and reflect their default value if not specified, or if
indirectly populated by child Objects.

.. _provider:

Provider
--------

:sup:`prototype` . name
    The name of the network the provider is connected to (e.g. 'homestead', 'ropsten', 'rinkeby', 'kovan')

:sup:`prototype` . chainId
    The chain ID (or network ID) this provider is connected as; this is used by
    signers to prevent `replay attacks`_ across compatible networks

FallbackProvider :sup:`( inherits from Provider )`
--------------------------------------------------

:sup:`prototype` . providers
    A **copy** of the array of providers (modifying this variable will not affect
    the providers attached)

JsonRpcProvider :sup:`( inherits from Provider )`
-------------------------------------------------

:sup:`prototype` . url
    The JSON-RPC URL the provider is connected to

:sup:`prototype` . send ( method , params )
    Send the JSON-RPC *method* with *params*. This is useful for calling
    non-standard or less common JSON-RPC methods. A :ref:`Promise <promise>` is
    returned which will resolve to the parsed JSON result.

EtherscanProvider :sup:`( inherits from Provider )`
---------------------------------------------------

:sup:`prototype` . apiToken
    The Etherscan API Token (or null if not specified)

InfuraProvider :sup:`( inherits from JsonRpcProvider )`
-------------------------------------------------------

:sup:`prototype` . apiAccessToken
    The INFURA API Access Token (or null if not specified)

Web3Provider :sup:`( inherits from JsonRpcProvider )`
-------------------------------------------------------

:sup:`prototype` . provider
    The underlying Web3-compatible provider from the Web3 library, for example
    an `HTTPProvider`_ or `IPCProvider`_. The only required method on a Web3 provider
    is:

    *sendAsync ( method , params , callback )*


-----

Account Actions
===============

:sup:`prototype` . getBalance ( addressOrName [ , blockTag ] )
    Returns a :ref:`Promise <promise>` with the balance (as a :ref:`BigNumber <bignumber>`) of
    *addressOrName* at *blockTag*. (See: :ref:`Block Tags <blocktag>`)

    **default:** *blockTag*\ ="latest"

:sup:`prototype` . getTransactionCount ( addressOrName [ , blockTag ] )
    Returns a :ref:`Promise <promise>` with the number of sent transactions (as a Number) from
    *addressOrName* at *blockTag*. This is also the nonce required to send a new
    transaction. (See: :ref:`Block Tags <blocktag>`)

    **default:** *blockTag*\ ="latest"

:sup:`prototype` . lookupAddress ( address )
    Returns a :ref:`Promise <promise>` which resolves to the ENS name (or null) that *address* resolves
    to.

:sup:`prototype` . resolveName ( ensName )
    Returns a :ref:`Promise <promise>` which resolves to the address (or null) of that the *ensName*
    resolves to.

*Examples*
----------

::

    var ethers = require('ethers');
    var providers = ethers.providers;

    var provider = providers.getDefaultProvider('ropsten');

    var address = "0x02F024e0882B310c6734703AB9066EdD3a10C6e0";

    provider.getBalance(address).then(function(balance) {

        // balance is a BigNumber (in wei); format is as a sting (in ether)
        var etherString = ethers.utils.formatEther(balance);

        console.log("Balance: " + etherString);
    });

    provider.getTransactionCount(address).then(function(transactionCount) {
        console.log("Total Transactions Ever Send: " + transactionCount);
    });

    provider.resolveName("test.ricmoose.eth").then(function(address) {
        console.log("Address: " + address);
    });

-----

Blockchain Status
=================

:sup:`prototype` . getBlockNumber ( )
    Returns a :ref:`Promise <promise>` with the latest block number (as a Number).

:sup:`prototype` . getGasPrice ( )
    Returns a :ref:`Promise <promise>` with the current gas price (as a :ref:`BigNumber <bignumber>`).

:sup:`prototype` . getBlock ( blockHashOrBlockNumber )
    Returns a :ref:`Promise <promise>` with the block at *blockHashorBlockNumber*. (See: :ref:`Block Responses <blockresponse>`)

:sup:`prototype` . getTransaction ( transactionHash )
    Returns a :ref:`Promise <promise>` with the transaction with *transactionHash*. (See: :ref:`Transaction Responses <transactionresponse>`)

:sup:`prototype` . getTransactionReceipt ( transactionHash )
    Returns a :ref:`Promise <promise>` with the transaction receipt with *transactionHash*.
    (See: :ref:`Transaction Receipts <transactionReceipt>`)

*Examples*
----------

**Current State**\ ::

    var provider = providers.getDefaultProvider();

    provider.getBlockNumber().then(function(blockNumber) {
        console.log("Current block number: " + blockNumber);
    });

    provider.getGasPrice().then(function(gasPrice) {
        // gasPrice is a BigNumber; convert it to a decimal string
        gasPriceString = gasPrice.toString();

        console.log("Current gas price: " + gasPriceString);
    });

**Blocks**\ ::

    var provider = providers.getDefaultProvider();

    // Block Number
    provider.getBlock(3346773).then(function(block) {
        console.log(block);
    });

    // Block Hash
    var blockHash = "0x7a1d0b010393c8d850200d0ec1e27c0c8a295366247b1bd6124d496cf59182ad";
    provider.getBlock(blockHash).then(function(block) {
        console.log(block);
    });

**Transactions**\ ::

    var provider = providers.getDefaultProvider();

    var transactionHash = "0x7baea23e7d77bff455d94f0c81916f938c398252fb62fce2cdb43643134ce4ed";

    provider.getTransaction(transactionHash).then(function(transaction) {
        console.log(transaction);
    });

    provider.getTransactionReceipt(transactionHash).then(function(transactionReceipt) {
        console.log(transactionReceipt);
    });

-----

Ethereum Name Resolution
========================

The Ethereum Naming Service (ENS) allows easy to remember and use names to be
assigned to Ethereum addresses. Any provider operation which takes an address
may also take an ENS name.

It is often useful to resolve a name entered by a user or perform a reverse lookup
of an address to get a more human readbale name.

**Resolving Names**\ ::

    var providers = require('ethers').providers;
    var provider = providers.getDefaultProvider();
    provider.resolveName('registrar.firefly.eth').then(function(address) {
        console.log(address);
        // '0x6fC21092DA55B392b045eD78F4732bff3C580e2c'
    });

**Looking up Addresses**\ ::

    provider.lookupAddress('0x6fC21092DA55B392b045eD78F4732bff3C580e2c').then(function(name) {
        console.log(name);
        // 'registrar.firefly.eth'
    });

-----

Contract Execution
==================

These are relatively low-level calls. The :ref:`Contracts API <api-contract>` should
usually be used instead.

:sup:`prototype` . call ( transaction )
    Send the **read-only** (constant) *transaction* to a single Ethereum node and
    return a :ref:`Promise <promise>` with the result (as a :ref:`hex string <hexstring>`) of executing it.
    (See :ref:`Transaction Requests <transactionrequest>`)

    This is free, since it does not change any state on the blockchain.

:sup:`prototype` . estimateGas ( transaction )
    Send a *transaction* to a single Ethereum node and return a :ref:`Promise <promise>` with the
    estimated amount of gas required (as a :ref:`BigNumber <bignumber>`) to send it.
    (See :ref:`Transaction Requests <transactionrequest>`)

    This is free, but only an estimate. Providing too little gas will result in a
    transaction being rejected (while still consuming all provided gas).

:sup:`prototype` . sendTransaction ( signedTransaction )
    Send the *signedTransaction* to the **entire** Ethereum network and returns a :ref:`Promise <promise>`
    with the transaction hash.

    **This will consume gas** from the account that signed the transaction.


*Examples*
----------

**Call (Constant) Functions** ::

    var ethers = require('ethers');
    var provider = ethers.providers.getDefaultProvider();

    // setup a transaction to call the CryptoKitties.symbol() function
    // CryptoKitties contract address
    var address = "0x06012c8cf97BEaD5deAe237070F9587f8E7A266d";
    // first 8 nibbles of the hash of symbol()
    var data = ethers.utils.id('symbol()').substring(0,10);
    var transaction = {
        to: address,
        data: data
    }

    provider.call(transaction).then(function(result) {
        console.log(result);
        // '0x000000000000000000000000000000000000000000000000000000000000002'+
        // '00000000000000000000000000000000000000000000000000000000000000002'+
        // '434b000000000000000000000000000000000000000000000000000000000000'
    });

**sendTransaction** ::

    var ethers = require('ethers');
    var privateKey = '0x0123456789012345678901234567890123456789012345678901234567890123';
    var wallet = new ethers.Wallet(privateKey);
    wallet.provider = ethers.providers.getDefaultProvider('ropsten');

    var transaction = {
        to: "0x88a5C2d9919e46F883EB62F7b8Dd9d0CC45bc290",
        value: ethers.utils.parseEther("0.1")
    };

    var estimateGasPromise = wallet.estimateGas(transaction);

    estimateGasPromise.then(function(gasEstimate) {
        console.log(gasEstimate.toString());
        transaction.gasLimit = gasEstimate;


        // Send the transaction
        var sendTransactionPromise = wallet.sendTransaction(transaction);

        sendTransactionPromise.then(function(transactionHash) {
           console.log(transactionHash);
        });
    });

-----

Contract State
==============

:sup:`prototype` . getCode ( addressOrName )
    Returns a :ref:`Promise <promise>` with the bytecode (as a :ref:`hex string <hexstring>`)
    at  *addressOrName*.

:sup:`prototype` . getStorageAt ( addressOrName , position [ , blockTag ] )
    Returns a :ref:`Promise <promise>` with the value (as a :ref:`hex string <hexstring>`) at
    *addressOrName* in *position* at *blockTag*. (See :ref:`Block Tags <blocktag>`)

    default: *blockTag*\ = "latest"

:sup:`prototype` . getLogs ( filter )
    Returns a :ref:`Promise <promise>` with an array (possibly empty) of the logs that
    match the *filter*. (See :ref:`Filters <filter>`)

*Examples*
----------

**getCode** ::

    var ethers = require('ethers');
    var provider = ethers.providers.getDefaultProvider();

    var contractAddress = '0x6fC21092DA55B392b045eD78F4732bff3C580e2c';
    var contractEnsName = 'registrar.firefly.eth';
    var codePromise = provider.getCode(contractEnsName);
    codePromise.then(function(result){
       console.log('getCode by ENS name:');
       console.log(result);
    });

    var codeByAddressPromise = provider.getCode(contractAddress);
    codeByAddressPromise.then(function(result){
       console.log('getCode by contract address:');
       console.log(result);
    });


**getStorageAt** ::


    var ethers = require('ethers');
    var provider = ethers.providers.getDefaultProvider();

    var contractEnsName = 'registrar.firefly.eth';
    var storagePromise = provider.getStorageAt(contractEnsName, 0);
    storagePromise.then(function(result){
       console.log(result);
    });

**getLogs** ::


    var ethers = require('ethers');
    var provider = ethers.providers.getDefaultProvider();

    var cryptoKittiesContractAddress = '0x06012c8cf97BEaD5deAe237070F9587f8E7A266d';
    var topic = '0x241ea03ca20251805084d27d4440371c34a0b85ff108f6bb5611248f73818b80';
    var filter = {
       fromBlock: 5044502,
       address: cryptoKittiesContractAddress,
       topics: [ topic ]
    }
    var filterPromise = provider.getLogs(filter);
    filterPromise.then(function(result){
       console.log(result);
    });




-----

Events
======

These methods allow management of callbacks on certain events on the blockchain
and contracts. They are largely based on the `EventEmitter API`_.

:sup:`prototype` . on ( eventType , callback )
    Register a callback for any future *eventType*; see below for callback parameters

:sup:`prototype` . once ( eventType , callback)
    Register a callback for the next (and only next) *eventType*; see below for callback parameters

:sup:`prototype` . removeListener ( eventType , callback )
    Unregister the *callback* for *eventType*; if the same callback is registered
    more than once, only the first registered instance is removed

:sup:`prototype` . removeAllListeners ( eventType )
    Unregister all callbacks for *eventType*

:sup:`prototype` . listenerCount ( [ eventType ] )
    Return the number of callbacks registered for *eventType*, or if ommitted, the
    total number of callbacks registered

:sup:`prototype` . resetEventsBlock ( blockNumber )
    Begin scanning for events from *blockNumber*. By default, events begin at the
    block number that the provider began polling at.

Event Types
-----------

"block"
    Whenever a new block is mined

    ``callback( blockNumber )``

any address
    When the balance of the corresponding address changes

    ``callback( balance )``

any transaction hash
    When the corresponding transaction is mined; also see
    :ref:`Waiting for Transactions <waitForTransaction>`

    ``callback( transaction )``

an array of topics
    When any of the topics are triggered in a block's logs; when using the
    :ref:`Contract API <api-contract>`, this is automatically handled;

    ``callback( log )``

.. _waitForTransaction:

Waiting for Transactions
------------------------

:sup:`prototype` . waitForTransaction ( transactionHash [ , timeout ] )
    Return a :ref:`Promise <promise>` which returns the transaction once *transactionHash* is
    mined, with an optional *timeout* (in milliseconds)

*Examples*
----------

::

    // Get notified on every new block
    provider.on('block', function(blockNumber) {
        console.log('New Block: ' + blockNumber);
    });

    // Get notified on account balance change
    provider.on('0x46Fa84b9355dB0708b6A57cd6ac222950478Be1d', function(balance) {
        console.log('New Balance: ' + balance);
    });

    // Get notified when a transaction is mined
    provider.once(transactionHash, function(transaction) {
        console.log('Transaction Minded: ' + transaction.hash);
        console.log(transaction);
    );

    // OR equivalently the waitForTransaction() returns a Promise

    provider.waitForTransaction(transactionHash).then(function(transaction) {
        console.log('Transaction Mined: ' + transaction.hash);
        console.log(transaction);
    });


    // Get notified when a contract event is logged
    var eventTopic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
    provider.on([ eventTopic ], function(log) {
        console.log('Event Log');
        console.log(log);
    });

-----

Objects
=======

There are several common objects and types that are commonly used as input parameters or
return types for various provider calls.

.. _blocktag:

Block Tag
---------

A block tag is used to uniquely identify a block's position in the blockchain:

a Number or :ref:`hex string <hexstring>`:
    Each block has a block number (eg. ``42`` or ``"0x2a``.

"latest":
    The most recently mined block.

"pending":
    The block that is currently being mined.

.. _blockresponse:

Block Responses
---------------

::

    {
        parentHash: "0x3d8182d27303d92a2c9efd294a36dac878e1a9f7cb0964fa0f789fa96b5d0667",
        hash: "0x7f20ef60e9f91896b7ebb0962a18b8defb5e9074e62e1b6cde992648fe78794b",
        number: 3346463,

        difficulty: 183765779077962,
        timestamp: 1489440489,
        nonce: "0x17060cb000d2c714",
        extraData: "0x65746865726d696e65202d20555331",

        gasLimit: utils.bigNumberify("3993225"),
        gasUsed: utils.bigNuberify("3254236"),

        miner: "0xEA674fdDe714fd979de3EdF0F56AA9716B898ec8",
        transactions: [
            "0x125d2b846de85c4c74eafb6f1b49fdb2326e22400ae223d96a8a0b26ccb2a513",
            "0x948d6e8f6f8a4d30c0bd527becbe24d15b1aba796f9a9a09a758b622145fd963",
            ... [ 49 more transaction hashes ] ...
            "0xbd141969b164ed70388f95d780864210e045e7db83e71f171ab851b2fba6b730"
        ]
    }

.. _transactionrequest:

Transaction Requests
--------------------

Any property which accepts a number may also be specified as a :ref:`BigNumber <bignumber>`
or :ref:`hex string <hexstring>`.

::

    // Example:
    {
        // Required unless deploying a contract (in which case omit)
        to: addressOrName,  // the target address or ENS name

        // These are optional/meaningless for call and estimateGas
        nonce: 0,           // the transaction nonce
        gasLimit: 0,        // the maximum gas this transaction may spend
        gasPrice: 0,        // the price (in wei) per unit of gas

        // These are always optional (but for call, data is usually specified)
        data: "0x",         // extra data for the transaction, or input for call
        value: 0,           // the amount (in wei) this transaction is sending
        chainId: 3          // the network ID; usually added by a signer
    }


.. _transactionresponse:

Transaction Response
--------------------

::

    // Example:
    {
        // Only available for mined transactions
        blockHash: "0x7f20ef60e9f91896b7ebb0962a18b8defb5e9074e62e1b6cde992648fe78794b",
        blockNumber: 3346463,
        transactionIndex: 51,

        // Exactly one of these will be present (send vs. deploy contract)
        creates: null,
        to: "0xc149Be1bcDFa69a94384b46A1F91350E5f81c1AB",

        // The transaction hash
        hash: "0xf517872f3c466c2e1520e35ad943d833fdca5a6739cfea9e686c4c1b3ab1022e",

        // See above (Transaction Requests) for these explained
        data: "0x",
        from: "0xEA674fdDe714fd979de3EdF0F56AA9716B898ec8",
        gasLimit: utils.bigNumberify("90000"),
        gasPrice: utils.bigNumberify("21488430592"),
        nonce: 0,
        value: utils.parseEther(1.0017071732629267),

        // The network ID (or chain ID); 0 indicates replay-attack vulnerable
        // (eg. 1 = Homestead mainnet, 3 = Ropsten testnet)
        networkId: 1,

        // The signature of the transaction
        r: "0x5b13ef45ce3faf69d1f40f9d15b0070cc9e2c92f3df79ad46d5b3226d7f3d1e8",
        s: "0x535236e497c59e3fba93b78e124305c7c9b20db0f8531b015066725e4bb31de6",
        v: 37,

        // The raw transaction
        raw: "0xf87083154262850500cf6e0083015f9094c149be1bcdfa69a94384b46a1f913" +
               "50e5f81c1ab880de6c75de74c236c8025a05b13ef45ce3faf69d1f40f9d15b0" +
               "070cc9e2c92f3df79ad46d5b3226d7f3d1e8a0535236e497c59e3fba93b78e1" +
               "24305c7c9b20db0f8531b015066725e4bb31de6"
    }

.. _transactionReceipt:

Transaction Receipts
--------------------

::

    // Example
    {
        transactionHash: "0x7dec07531aae8178e9d0b0abbd317ac3bb6e8e0fd37c2733b4e0d382ba34c5d2",

        // The block this transaction was mined into
        blockHash: "0xca1d4d9c4ac0b903a64cf3ae3be55cc31f25f81bf29933dd23c13e51c3711840",
        blockNumber: 3346629,

        // The index into this block of the transaction
        transactionIndex: 1,

        // The address of the contract (if one was created)
        contractAddress: null,

        // Gas
        cumulativeGasUsed: utils.bigNumberify("42000"),
        gasUsed: utils.bigNumberify("21000"),

        // Logs
        log: [ ],
        logsBloom: "0x00" ... [ 256 bytes of 0 ] ... "00",

        // Post-Byzantium hard-fork
        byzantium: false

        ////////////
        // Pre-byzantium blocks will have a state root:
        root: "0x8a27e1f7d3e92ae1a01db5cce3e4718e04954a34e9b17c1942011a5f3a942bf4",

        ////////////
        // Post-byzantium blocks will have a status (0 indicated failure during execution)
        // status: 1
    }

.. _filter:

Filters
-------

Filtering on topics supports a `somewhat complicated`_ specification, however,
for the vast majority of filters, a single topic is usually sufficient (see the example below).

The *EtherscanProvider* only supports a single topic.

::

    // Example
    {
        // Optional; The range of blocks to limit querying (See: Block Tags above)
        fromBlock: "latest",
        toBlock: "latest",

        // Optional; An address (or ENS name) to filter by
        address: addressOrName,

        // Optional; A (possibly nested) list of topics
        topics: [ topic1 ]
    }

-----

Provider Specific Extra API Calls
=================================

Etherscan
---------

:sup:`prototype` . getEtherPrice ( )
    Returns a :ref:`Promise <promise>` with the price of ether in USD.

:sup:`prototype` . getHistory ( addressOrName [ , startBlock [ , endBlock ] ] )
    Returns a :ref:`Promise <promise>` with an array of :ref:`Transaction Responses <transactionresponse>`
    for each transaction to or from *addressOrName* between *startBlock* and *endBlock* (inclusive).

**Examples**

::

    var provider = new ethers.providers.EtherscanProvider();

    // Getting the current Ethereum price
    provider.getEtherPrice().then(function(price) {
        console.log("Ether price in USD: " + price);
    });


    // Getting the transaction history of an address
    var address = '0xb2682160c482eB985EC9F3e364eEc0a904C44C23';
    var startBlock = 3135808;
    var endBlock = 5091477;
    provider.getHistory(address, startBlock, endBlock).then(function(history) {
        console.log(history);
        // [
        //   {
        //     hash: '0x327632ccb6d7bb47b455383e936b2f14e6dc50dbefdc214870b446603b468675',
        //     blockHash: '0x0415f0d2741de45fb748166c7dc2aad9b3ff66bcf7d0a127f42a71d3e286c36d',
        //     blockNumber: 3135808,
        //     transactionIndex: 1,
        //     from: '0xb2682160c482eB985EC9F3e364eEc0a904C44C23',
        //     gasPrice: ethers.utils.bigNumberify('0x4a817c800'),
        //     gasLimit: ethers.utils.bigNumberify('0x493e0'),
        //     to: '0xAe572713CfE65cd7033774170F029B7219Ee7f70',
        //     value: ethers.utils.bigNumberify('0xd2f13f7789f0000'),
        //     nonce: 25,
        //     data: '0x',
        //     creates: null,
        //     networkId: 0
        //   },
        //   {
        //     hash: '0x7c10f2e7125a1fa5e37b54f5fac5465e8d594f89ff97916806ca56a5744812d9',
        //     ...
        //   }
        // ]
    });


Web3Provider
------------

:sup:`prototype` . listAccounts ( )
    Returns a :ref:`Promise <promise>` with a list of all accounts the node connected
    to this Web3 controls.

:sup:`prototype` . getSigner( [ address ] )
    Returns a :ref:`Signer <custom-signer>` that uses an account on the node
    the Web3 object is connected to. If no address is specified, the first
    account on the node is used.


**Examples**

::

    web3Provider.listAccounts().then(function(accounts) {
        var signer = web3Provider.getSigner(accounts[1]);
        console.log(signer);
    });

-----

.. _Etherscan: https://etherscan.io/apis
.. _web service API: https://etherscan.io/apis
.. _INFURA: https://infura.io
.. _Parity: https://ethcore.io/parity.html
.. _Geth: https://geth.ethereum.org
.. _JSON-RPC API: https://github.com/ethereum/wiki/wiki/JSON-RPC
.. _EventEmitter API: https://nodejs.org/dist/latest-v6.x/docs/api/events.html
.. _replay attacks: https://github.com/ethereum/EIPs/issues/155
.. _somewhat complicated: https://github.com/ethereum/wiki/wiki/JSON-RPC#a-note-on-specifying-topic-filters
.. _HTTPProvider: https://github.com/ethereum/web3.js/blob/develop/lib/web3/httpprovider.js
.. _IPCProvider: https://github.com/ethereum/web3.js/blob/develop/lib/web3/ipcprovider.js

.. EOF
