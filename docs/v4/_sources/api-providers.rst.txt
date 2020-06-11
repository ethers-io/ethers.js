.. |nbsp| unicode:: U+00A0 .. non-breaking space

.. _api-provider:

Providers
*********

A Provider abstracts a connection to the Ethereum blockchain, for issuing queries
and sending signed state changing transactions.

The *EtherscanProvider* and *InfuraProvider* offer the ability to connect to public
third-party providers without the need to run any Ethereum node yourself.

The *JsonRpcProvider* and *IpcProvider* allow you to connect to Ethereum nodes you
control or have access to, including mainnet, testnets, proof-of-authority (PoA)
nodes or Ganache.

If you already have a Web3 application, or Web3-compatible Provider
(e.g. MetaMask's web3.currentProvider), it can be wrapped by a *Web3Provider* to make
it compatible with the ethers Provider API.

For most situations, it is recommended that you use a default provider, which will
connect to both Etherscan and INFURA simultaneously:

.. code-block:: javascript
    :caption: *connect to a default provider*

    // You can use any standard network name
    //  - "homestead"
    //  - "rinkeby"
    //  - "ropsten"
    //  - "kovan"
    //  - "goerli"

    let provider = ethers.getDefaultProvider('ropsten');

.. code-block:: javascript
    :caption: *connect to MetaMask*

    // The network will be automatically detected; if the network is
    // changed in MetaMask, it causes a page refresh.

    let provider = new ethers.providers.Web3Provider(web3.currentProvider);

-----

.. _provider-connect:

Connecting to Ethereum
======================

There are several methods to connect to the Ethereum network provided. If you are not
running your own local Ethereum node, it is recommended that you use the ``getDefaultProvider()``
method.

:sup:`ethers` . getDefaultProvider( [ network :sup:`= "homestead"` ] ) |nbsp| :sup:`=>` |nbsp| :sup:`Provider`
    This creates a FallbackProvider backed by multiple backends (INFURA and Etherscan).

    This is the **recommended** method of connecting to the Ethereum network if you are
    not running your own Ethereum node.

new :sup:`ethers . providers` . EtherscanProvider( [ network :sup:`= "homestead"` ] [ , apiToken ] )
    Connect to the `Etherscan`_ blockchain `web service API`_.

    **Also See:** Etherscan provider-specific :ref:`Properties <provider-etherscan-properties>` and :ref:`Operations <provider-etherscan-extra>`

new :sup:`ethers . providers` . InfuraProvider( [ network :sup:`= "homestead"` ] [ , apiAccessToken ] )
    Connect to the `INFURA`_ hosted network of Ethereum nodes.

    **Also See:** INFURA provider-specific :ref:`Properties <provider-infura-properties>`

new :sup:`ethers . providers` . JsonRpcProvider( [ urlOrInfo :sup:`= "http://localhost:8545"` ] [ , network ] )
    Connect to the `JSON-RPC API`_ URL *urlorInfo* of an Ethereum node, such as `Parity`_ or `Geth`_.

    The *urlOrInfo* may also be specified as an object with the properties:

    - **url** --- the JSON-RPC URL (required)
    - **user** --- a username to use for Basic Authentication (optional)
    - **password** --- a password to use for Basic Authentication (optional)
    - **allowInsecure** --- allow Basic Authentication over an insecure HTTP network (default: false)

    **Also See:** JSON-RPC provider-specific :ref:`Properties <provider-jsonrpc-properties>` and :ref:`Operations <provider-jsonrpc-extra>`

new :sup:`ethers . providers` . Web3Provider( web3Provider [ , network ] )
    Connect to an existing Web3 provider (e.g. `web3Instance.currentProvider`).

    The *network* is also automatically detected if not specified; see the above
    description of *network* for JsonRpcProvider for details.

    **Also See:** Web3 provider-specific :ref:`Properties <provider-web3-properties>` and :ref:`Operations <provider-jsonrpc-extra>`

new :sup:`ethers . providers` . FallbackProvider( providers )
    Improves reliability by attempting each provider in turn, falling back to the
    next in the list if an error was encountered. The network is determined from the
    providers and the **must** match each other.

    **Also See:** Fallback provider-specific :ref:`Properties <provider-fallback-properties>`

new :sup:`ethers . providers` . IpcProvider( path [ , network ] )
    Connect to the `JSON-RPC API`_ *path* over IPC (named pipes) to an Ethereum node, such
    as `Parity`_ or `Geth`_.

    The *network* is also automatically detected if not specified; see the above
    description of *network* for JsonRpcProvider for details.

    **Also See:** IPC provider-specific :ref:`Properties <provider-ipc-properties>` and :ref:`Operations <provider-jsonrpc-extra>`

.. code-block:: javascript
    :caption: *connect to third-party providers*

    // You can use any standard network name
    //  - "homestead"
    //  - "rinkeby"
    //  - "ropsten"
    //  - "kovan"

    let defaultProvider = ethers.getDefaultProvider('ropsten');

    // ... OR ...

    let etherscanProvider = new ethers.providers.EtherscanProvider('ropsten');

    // ... OR ...

    let infuraProvider = new ethers.providers.InfuraProvider('ropsten');

.. code-block:: javascript
    :caption: *connect to a Geth or Parity node*

    // When using the JSON-RPC API, the network will be automatically detected


    // Default: http://localhost:8545
    let httpProvider = new ethers.providers.JsonRpcProvider();


    // To connect to a custom URL:
    let url = "http://something-else.com:8546";
    let customHttpProvider = new ethers.providers.JsonRpcProvider(url);


    // Connect over named pipes using IPC:
    let path = "/var/run/parity.ipc";
    let ipcProvider = new ethers.providers.IpcProvider(path);


.. code-block:: javascript
    :caption: *connect to an existing Web3 Provider*

    // When using a Web3 provider, the network will be automatically detected

    // e.g. HTTP provider
    let currentProvider = new web3.providers.HttpProvider('http://localhost:8545');

    let web3Provider = new ethers.providers.Web3Provider(currentProvider);

-----

Properties
==========

All properties are immutable unless otherwise specified, and will reflect their
default values if left unspecified.

.. _provider:

Provider
--------

:sup:`prototype` . blockNumber
    The most recent block number (block height) this provider has seen and has triggered
    events for. If no block has been seen, this is *null*.

:sup:`prototype` . polling
    *mutable*

    If the provider is currently polling because it is actively watching for events. This
    may be set to enable/disable polling temporarily or disabled permanently to allow a
    node process to exit.

:sup:`prototype` . pollingInterval
    *mutable*

    The frequency (in ms) that the provider is polling. The default interval is 4 seconds.

    This may make sense to lower for PoA networks or when polling a local node. When polling
    Etherscan or INFURA, setting this too low may result in the service blocking your IP
    address or otherwise throttling your API calls.

.. _provider-etherscan-properties:

EtherscanProvider :sup:`( inherits from Provider )`
-------------------------------------------------------

:sup:`prototype` . apiToken
    The Etherscan API Token (or null if not specified)

.. _provider-infura-properties:

InfuraProvider :sup:`( inherits from JsonRpcProvider )`
-------------------------------------------------------

:sup:`prototype` . apiAccessToken
    The INFURA API Access Token (or null if not specified)


.. _provider-jsonrpc-properties:

JsonRpcProvider :sup:`( inherits from Provider )`
-----------------------------------------------------

:sup:`prototype` . connection
    An object describing the connection of the JSON-RPC endpoint with the properties:

    - **url** --- the JSON-RPC URL
    - **user** --- a username to use for Basic Authentication (optional)
    - **password** --- a password to use for Basic Authentication (optional)
    - **allowInsecure** --- allows Basic Authentication over an insecure HTTP network

.. _provider-web3-properties:

Web3Provider :sup:`( inherits from JsonRpcProvider )`
-----------------------------------------------------

:sup:`prototype` . provider
    The underlying Web3-compatible provider from the Web3 library, for example
    an `HTTPProvider`_ or `IPCProvider`_. The only required method on a Web3 provider
    is:

    - **sendAsync ( method , params , callback )**

.. _provider-fallback-properties:

FallbackProvider :sup:`( inherits from Provider )`
------------------------------------------------------

:sup:`prototype` . providers
    A **copy** of the array of providers (modifying this variable will not affect
    the attached providers)


.. _provider-ipc-properties:

IpcProvider :sup:`( inherits from JsonRpcProvider )`
----------------------------------------------------

:sup:`prototype` . path
    The JSON-RPC IPC (named pipe) path the provider is connected to.


-----

.. _provider-network:

Network
=======

:sup:`prototype` . getNetwork ( ) |nbsp| :sup:`=>` |nbsp| :sup:`Promise<Network>`
    A :ref:`Promise <promise>` that resolves to a :ref:`Network <network>` object
    describing the connected network and chain.

-----

.. _provider-account:

Account
=======

:sup:`prototype` . getBalance ( addressOrName [ , blockTag :sup:`= "latest"` ] ) |nbsp| :sup:`=>` |nbsp| :sup:`Promise<BigNumber>`
    Returns a :ref:`Promise <promise>` with the balance (as a :ref:`BigNumber <bignumber>`) of
    *addressOrName* at *blockTag*. (See: :ref:`Block Tags <blocktag>`)

:sup:`prototype` . getTransactionCount ( addressOrName [ , blockTag :sup:`= "latest"` ] ) |nbsp| :sup:`=>` |nbsp| :sup:`Promise<number>`
    Returns a :ref:`Promise <promise>` with the number of sent transactions (as a Number) from
    *addressOrName* at *blockTag*. This is also the nonce required to send a new
    transaction. (See: :ref:`Block Tags <blocktag>`)


.. code-block:: javascript
    :caption: *get the balance of an account*

    let address = "0x02F024e0882B310c6734703AB9066EdD3a10C6e0";

    provider.getBalance(address).then((balance) => {

        // balance is a BigNumber (in wei); format is as a sting (in ether)
        let etherString = ethers.utils.formatEther(balance);

        console.log("Balance: " + etherString);
    });

.. code-block:: javascript
    :caption: *get the transaction count of an account*

    let address = "0x02F024e0882B310c6734703AB9066EdD3a10C6e0";

    provider.getTransactionCount(address).then((transactionCount) => {
        console.log("Total Transactions Ever Sent: " + transactionCount);
    });

-----

.. _provider-blockchain:

Blockchain Status
=================

:sup:`prototype` . getBlockNumber ( ) |nbsp| :sup:`=>` |nbsp| :sup:`Promise<number>`
    Returns a :ref:`Promise <promise>` with the latest block number (as a Number).

:sup:`prototype` . getGasPrice ( ) |nbsp| :sup:`=>` |nbsp| :sup:`Promise<BigNumber>`
    Returns a :ref:`Promise <promise>` with the current gas price (as a :ref:`BigNumber <bignumber>`).

:sup:`prototype` . getBlock ( blockHashOrBlockNumber ) |nbsp| :sup:`=>` |nbsp| :sup:`Promise<Block>`
    Returns a :ref:`Promise <promise>` with the block at *blockHashOrBlockNumber*. (See: :ref:`Block Responses <blockresponse>`)

:sup:`prototype` . getTransaction ( transactionHash ) |nbsp| :sup:`=>` |nbsp| :sup:`Promise<TransactionResponse>`
    Returns a :ref:`Promise <promise>` with the transaction with *transactionHash*. (See: :ref:`Transaction Responses <transaction-response>`)

:sup:`prototype` . getTransactionReceipt ( transactionHash ) |nbsp| :sup:`=>` |nbsp| :sup:`Promise<TransactionReceipt>`
    Returns a :ref:`Promise <promise>` with the transaction receipt with *transactionHash*.
    (See: :ref:`Transaction Receipts <transaction-receipt>`)


.. code-block:: javascript
    :caption: *current state*

    provider.getBlockNumber().then((blockNumber) => {
        console.log("Current block number: " + blockNumber);
    });

    provider.getGasPrice().then((gasPrice) => {
        // gasPrice is a BigNumber; convert it to a decimal string
        gasPriceString = gasPrice.toString();

        console.log("Current gas price: " + gasPriceString);
    });

.. code-block:: javascript
    :caption: *blocks*

    // See: https://ropsten.etherscan.io/block/3346773

    // Block Number
    provider.getBlock(3346773).then((block) => {
        console.log(block);
    });

    // Block Hash
    let blockHash = "0x7a1d0b010393c8d850200d0ec1e27c0c8a295366247b1bd6124d496cf59182ad";
    provider.getBlock(blockHash).then((block) => {
        console.log(block);
    });

.. code-block:: javascript
    :caption: *transactions*

    // See: https://ropsten.etherscan.io/tx/0xa4ddad980075786c204b45ab8193e543aec4411bd94894abef47dc90d4d3cc01

    let transactionHash = "0xa4ddad980075786c204b45ab8193e543aec4411bd94894abef47dc90d4d3cc01"

    provider.getTransaction(transactionHash).then((transaction) => {
        console.log(transaction);
    });

    provider.getTransactionReceipt(transactionHash).then((receipt) => {
        console.log(receipt);
    });

-----

.. _provider-ens:

Ethereum Naming Service
=======================

The `Ethereum Naming Service`_ (ENS) allows easy to remember and use names to be
assigned to Ethereum addresses. Any provider operation which takes an address
may also take an ENS name.

ENS also provides the ability for a reverse lookup, which determines the name
for an address if it has been configured.

:sup:`prototype` . resolveName ( ensName ) |nbsp| :sup:`=>` |nbsp| :sup:`Promise<Address>`
    Returns a :ref:`Promise <promise>` which resolves to the address of that the *ensName*
    resolves to (or *null* is not configured).

:sup:`prototype` . lookupAddress ( address ) |nbsp| :sup:`=>` |nbsp| :sup:`Promise<string>`
    Returns a :ref:`Promise <promise>` which resolves to the ENS name that *address* resolves
    to (or *null* if not configured).

.. code-block:: javascript
    :caption: *resolve an ENS name to an address*

    provider.resolveName("registrar.firefly.eth").then(function(address) {
        console.log("Address: " + address);
        // "0x6fC21092DA55B392b045eD78F4732bff3C580e2c"
    });

.. code-block:: javascript
    :caption: *lookup the ENS name of an address*

    let address = "0x6fC21092DA55B392b045eD78F4732bff3C580e2c";
    provider.lookupAddress(address).then(function(address) {
        console.log("Name: " + address);
        // "registrar.firefly.eth"
    });

-----

.. _provider-calling:

Contract Execution
==================

These are relatively low-level calls. The :ref:`Contracts API <api-contract>` should
usually be used instead.

:sup:`prototype` . call ( transaction ) |nbsp| :sup:`=>` |nbsp| :sup:`Promise<hex>`
    Send the **read-only** (constant) *transaction* to a single Ethereum node and
    return a :ref:`Promise <promise>` with the result (as a :ref:`hex string <hexstring>`) of executing it.
    (See :ref:`Transaction Requests <transaction-request>`)

    This is free, since it does not change any state on the blockchain.

:sup:`prototype` . estimateGas ( transaction ) |nbsp| :sup:`=>` |nbsp| :sup:`Promise<BigNumber>`
    Send a *transaction* to a single Ethereum node and return a :ref:`Promise <promise>` with the
    estimated amount of gas required (as a :ref:`BigNumber <bignumber>`) to send it.
    (See :ref:`Transaction Requests <transaction-request>`)

    This is free, but only an estimate. Providing too little gas will result in a
    transaction being rejected (while still consuming all provided gas).

:sup:`prototype` . sendTransaction ( signedTransaction ) |nbsp| :sup:`=>` |nbsp| :sup:`Promise<TransactionResponse>`
    Send the *signedTransaction* to the **entire** Ethereum network and returns a :ref:`Promise <promise>`
    that resolves to the :ref:`Transaction Response <transaction-response>`.

    If an error occurs after the netowrk **may have** received the transaction, the
    promise will reject with the error, with the additional property ``transactionHash``
    so that further processing may be done.

    **This will consume gas** from the account that signed the transaction.


.. code-block:: javascript
    :caption: *calling constant functions*

    // See: https://ropsten.etherscan.io/address/0x6fc21092da55b392b045ed78f4732bff3c580e2c

    // Setup a transaction to call the FireflyRegistrar.fee() function

    // FireflyRegistrar contract address
    let address = "0x6fC21092DA55B392b045eD78F4732bff3C580e2c";

    // First 4 bytes of the hash of "fee()" for the sighash selector
    let data = ethers.utils.hexDataSlice(ethers.utils.id('fee()'), 0, 4);

    let transaction = {
        to: ensName,
        data: data
    }

    let callPromise = defaultProvider.call(transaction);

    callPromise.then((result) => {
        console.log(result);
        // "0x000000000000000000000000000000000000000000000000016345785d8a0000"

        console.log(ethers.utils.formatEther(result));
        // "0.1"
    });

.. code-block:: javascript
    :caption: *sending a transaction*

    let privateKey = '0x0123456789012345678901234567890123456789012345678901234567890123';
    let wallet = new ethers.Wallet(privateKey, provider);

    let transaction = {
        to: "ricmoo.firefly.eth",
        value: ethers.utils.parseEther("0.1")
    };

    // Send the transaction
    let sendTransactionPromise = wallet.sendTransaction(transaction);

    sendTransactionPromise.then((tx) => {
       console.log(tx);
    });

-----

.. _provider-contract:

Contract State
==============

:sup:`prototype` . getCode ( addressOrName ) |nbsp| :sup:`=>` |nbsp| :sup:`Promise<hex>`
    Returns a :ref:`Promise <promise>` with the bytecode (as a :ref:`hex string <hexstring>`)
    at  *addressOrName*.

:sup:`prototype` . getStorageAt ( addressOrName , position [ , blockTag :sup:`= "latest"` ] ) |nbsp| :sup:`=>` |nbsp| :sup:`Promise<hex>`
    Returns a :ref:`Promise <promise>` with the value (as a :ref:`hex string <hexstring>`) at
    *addressOrName* in *position* at *blockTag*. (See :ref:`Block Tags <blocktag>`)

:sup:`prototype` . getLogs ( filter ) |nbsp| :sup:`=>` |nbsp| :sup:`Promise< Log [ ] >`
    Returns a :ref:`Promise <promise>` with an array (possibly empty) of the logs that
    match the *filter*. (See :ref:`Filters <filter>`)

.. code-block:: javascript
    :caption: *get contract code*

    let contractEnsName = 'registrar.firefly.eth';

    let codePromise = provider.getCode(contractEnsName);

    codePromise.then((result) => {
       console.log(result);
    });

.. code-block:: javascript
    :caption: *get contract storage value*

    let contractEnsName = 'registrar.firefly.eth';

    // Position 0 in the FireflyRegistrar contract holds the ENS address

    let storagePromise = provider.getStorageAt(contractEnsName, 0);

    storagePromise.then((result) => {
       console.log(result);
       // "0x000000000000000000000000112234455c3a32fd11230c42e7bccd4a84e02010"
    });

.. code-block:: javascript
    :caption: *get contract event logs*

    let contractEnsName = 'registrar.firefly.eth';

    let topic = ethers.utils.id("nameRegistered(bytes32,address,uint256)");

    let filter = {
        address: contractEnsName,
        fromBlock: 3313425,
        toBlock: 3313430,
        topics: [ topic ]
    }

    provider.getLogs(filter).then((result) => {
        console.log(result);
        // [ {
        //    blockNumber: 3313426,
        //    blockHash: "0xe01c1e437ed3af9061006492cb07454eca8561479454a709809b7897f225387d",
        //    transactionIndex: 5,
        //    removed: false,
        //    address: "0x6fC21092DA55B392b045eD78F4732bff3C580e2c",
        //    data: "0x00000000000000000000000053095760c154a1531a69fc718119d14c4aa1506f" +
        //            "000000000000000000000000000000000000000000000000016345785d8a0000",
        //    topics: [
        //      "0x179ef3319e6587f6efd3157b34c8b357141528074bcb03f9903589876168fa14",
        //      "0xe625ed7b108857745d1d9889a7ae05861d8aee38e0e92fd3a31191de01c2515b"
        //    ],
        //    transactionHash: "0x61d641aaf3dcf4cf6bafc3e79d332d8773ea0688f87eb00f8b60c3f0050e55f0",
        //    logIndex: 5
        // } ]

    });

-----

.. _provider-events:

Events
======

These methods allow management of callbacks on certain events on the blockchain
and contracts. They are largely based on the `EventEmitter API`_.

:sup:`prototype` . on ( eventType , callback ) |nbsp| :sup:`=>` |nbsp| :sup:`Provider`
    Register a callback for any future *eventType*; see below for callback parameters

:sup:`prototype` . once ( eventType , callback) |nbsp| :sup:`=>` |nbsp| :sup:`Provider`
    Register a callback for the next (and only next) *eventType*; see below for callback parameters

:sup:`prototype` . removeListener ( eventType , callback ) |nbsp| :sup:`=>` |nbsp| :sup:`boolean`
    Unregister the *callback* for *eventType*; if the same callback is registered
    more than once, only the first registered instance is removed

:sup:`prototype` . removeAllListeners ( eventType ) |nbsp| :sup:`=>` |nbsp| :sup:`Provider`
    Unregister all callbacks for *eventType*

:sup:`prototype` . listenerCount ( [ eventType ] ) |nbsp| :sup:`=>` |nbsp| :sup:`number`
    Return the number of callbacks registered for *eventType*, or if ommitted, the
    total number of callbacks registered

:sup:`prototype` . resetEventsBlock ( blockNumber ) |nbsp| :sup:`=>` |nbsp| :sup:`void`
    Begin scanning for events from *blockNumber*. By default, events begin at the
    block number that the provider began polling at.

Event Types
-----------

"block"
    Whenever a new block is mined

    ``callback( blockNumber )``

"pending"
    Whenever a new transaction is added to the transaction pool. This is **NOT**
    available on Etherscan or INFURA providers and may not be reliable on any
    provider.

    ``callback( transactionHash )``

"error"
    Whenever an error occurs during an event.

    ``callback( error )``

any address
    When the balance of the corresponding address changes.

    ``callback( balance )``

any transaction hash
    When the corresponding transaction has been included in a block; also see
    :ref:`Waiting for Transactions <waitForTransaction>`.

    ``callback( transactionReceipt )``

a filtered event object
    When the an event is logged by a transaction to the *address* with the
    associated *topics*. The filtered event properties are:

    - **address** --- the contract address to filter by (optional)
    - **topics** --- the log topics to filter by (optional)

    ``callback( log )``

an array of topics
    When any of the topics are logs by a transaction to any address. This is
    equivalent to using a filter object with no *address*.

    ``callback( log )``

.. _waitForTransaction:

Waiting for Transactions
------------------------

:sup:`prototype` . waitForTransaction ( transactionHash ) |nbsp| :sup:`=>` |nbsp| :sup:`Promise<TransactionReceipt>`
    Return a :ref:`Promise <promise>` which resolves to the
    :ref:`Transaction Receipt <transaction-receipt>` once *transactionHash* is
    mined.

.. code-block:: javascript
    :caption: *new blocks*

    provider.on('block', (blockNumber) => {
        console.log('New Block: ' + blockNumber);
    });

.. code-block:: javascript
    :caption: *account balance changes*

    provider.on('0x46Fa84b9355dB0708b6A57cd6ac222950478Be1d', (balance) => {
        console.log('New Balance: ' + balance);
    });

.. code-block:: javascript
    :caption: *transaction mined*

    provider.once(transactionHash, (receipt) => {
        console.log('Transaction Minded: ' + receipt.hash);
        console.log(receipt);
    );

    // ... OR ...

    provider.waitForTransaction(transactionHash).then((receipt) => {
        console.log('Transaction Mined: ' + receipt.hash);
        console.log(receipt);
    });

.. code-block:: javascript
    :caption: *a filtered event has been logged*

    let contractEnsName = 'registrar.firefly.eth';

    let topic = ethers.utils.id("nameRegistered(bytes32,address,uint256)");

    let filter = {
        address: contractEnsName,
        topics: [ topic ]
    }

    provider.on(filter, (result) => {
        console.log(result);
        // {
        //    blockNumber: 3606106,
        //    blockHash: "0x878aa7059c93239437f66baeec82332dcb2f9288bcdf6eb1ff3ba6998cdf8f69",
        //    transactionIndex: 6,
        //    removed: false,
        //    address: "0x6fC21092DA55B392b045eD78F4732bff3C580e2c",
        //    data: "0x00000000000000000000000006b5955a67d827cdf91823e3bb8f069e6c89c1d6" +
        //            "000000000000000000000000000000000000000000000000016345785d8a0000",
        //    topics: [
        //      "0x179ef3319e6587f6efd3157b34c8b357141528074bcb03f9903589876168fa14",
        //      "0x90a4d0958790016bde1de8375806da3be227ff48e611aefea36303fb86bca5ad"
        //    ],
        //    transactionHash: "0x0d6f43accb067ca8e391666f37f8e8ad75f88ebd8036c9166fd2d0b93b214d2e",
        //    logIndex: 6
        // }
    });


-----

Objects and Types
=================

There are several common objects and types that are commonly used as input parameters or
return types for various provider calls.

-----

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

-----

.. _blockresponse:

Block Responses
---------------

.. code-block:: javascript
    :caption: *Example*

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

-----

.. _network:

Network
-------

A network repsents various properties of a network, such as mainnet (i.e. "homestead") or
one of the testnets (e.g. "ropsten", "rinkeby" or "kovan") or alternative networks
(e.g. "classic"). A Network has the following properties:

    - *name* --- the name of the network (e.g. "homestead", "rinkeby")
    - *chainId* --- the chain ID (network ID) of the connected network
    - *ensAddress* --- the address of ENS if it is deployed to the network, otherwise *null*

If a network does not have the ENS contract deployed to it, names cannot be resolved to addresses.

.. code-block:: javascript
    :caption: *get a standard network*

    let network = ethers.providers.getNetwork('homestead');
    // {
    //    chainId: 1,
    //    ensAddress: "0x314159265dd8dbb310642f98f50c066173c1259b",
    //    name: "homestead"
    // }

.. code-block:: javascript
    :caption: *a custom development network*

    let network = {
        chainId: 1337,
        name: "dev"
    }

-----

.. _transaction-request:

Transaction Requests
--------------------

Any property which accepts a number may also be specified as a :ref:`BigNumber <bignumber>`
or :ref:`hex string <hexstring>`. Any property may also be given as a :ref:`Promise <promise>`
which resolves to the expected type.

.. code-block:: javascript
    :caption: *Example*

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

-----

.. _transaction-response:

Transaction Response
--------------------

.. code-block:: javascript
    :caption: *Example*

    {
        // Only available for mined transactions
        blockHash: "0x7f20ef60e9f91896b7ebb0962a18b8defb5e9074e62e1b6cde992648fe78794b",
        blockNumber: 3346463,
        timestamp: 1489440489,

        // Exactly one of these will be present (send vs. deploy contract)
        // They will always be a properly formatted checksum address
        creates: null,
        to: "0xc149Be1bcDFa69a94384b46A1F91350E5f81c1AB",

        // The transaction hash
        hash: "0xf517872f3c466c2e1520e35ad943d833fdca5a6739cfea9e686c4c1b3ab1022e",

        // See above "Transaction Requests" for details
        data: "0x",
        from: "0xEA674fdDe714fd979de3EdF0F56AA9716B898ec8",
        gasLimit: utils.bigNumberify("90000"),
        gasPrice: utils.bigNumberify("21488430592"),
        nonce: 0,
        value: utils.parseEther(1.0017071732629267),

        // The chain ID; 0 indicates replay-attack vulnerable
        // (eg. 1 = Homestead mainnet, 3 = Ropsten testnet)
        chainId: 1,

        // The signature of the transaction (TestRPC may fail to include these)
        r: "0x5b13ef45ce3faf69d1f40f9d15b0070cc9e2c92f3df79ad46d5b3226d7f3d1e8",
        s: "0x535236e497c59e3fba93b78e124305c7c9b20db0f8531b015066725e4bb31de6",
        v: 37,

        // The raw transaction (TestRPC may be missing this)
        raw: "0xf87083154262850500cf6e0083015f9094c149be1bcdfa69a94384b46a1f913" +
               "50e5f81c1ab880de6c75de74c236c8025a05b13ef45ce3faf69d1f40f9d15b0" +
               "070cc9e2c92f3df79ad46d5b3226d7f3d1e8a0535236e497c59e3fba93b78e1" +
               "24305c7c9b20db0f8531b015066725e4bb31de6"
    }

-----

.. _transaction-receipt:

Transaction Receipts
--------------------

.. code-block:: javascript
    :caption: *Example*

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

        // Logs (an Array of Logs)
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

-----

.. _log:

Log
---

.. code-block:: javascript
    :caption: *Example*

    {
        // The block this log was emitted by
        blockNumber: 
        blockHash:

        // The transaction this log was emiited by
        transactionHash:
        transactionIndex:
        logIndex:

        // Whether the log has been removed (due to a chain re-org)
        removed: false,

        // The contract emitting the log
        address:

        // The indexed data (topics) and non-indexed data (data) for this log
        topics: []
        data: 
    }

-----

.. _filter:

Filters
-------

Filtering on topics supports a `somewhat complicated`_ specification, however,
for the vast majority of filters, a single topic is usually sufficient (see the example below).

The *EtherscanProvider* currently only supports a single topic.

.. code-block:: javascript
    :caption: *Example*

    {
        // Optional; The range of blocks to limit querying (See: Block Tags above)
        fromBlock: "latest",
        toBlock: "latest",

        // Optional; The specific block to limit the query to
        // Note: This may NOT be used with fromBlock or toBlock
        // Note: EtherscanProvider does not support blockHash
        // Note: This may be used for getLogs, but not as a provider Event (i.e. .on)
        blockHash: blockHash,

        // Optional; An address (or ENS name) to filter by
        address: addressOrName,

        // Optional; A (possibly nested) list of topics
        topics: [ topic1 ]
    }

@TODO: Link to cookbook entry for filtering ERC-20 events for an address

-----

Provider Specific Extra API Calls
=================================

.. _provider-etherscan-extra:

Etherscan
---------

:sup:`prototype` . getEtherPrice ( )
    Returns a :ref:`Promise <promise>` with the price of ether in USD.

:sup:`prototype` . getHistory ( addressOrName [ , startBlock :sup:`= 0` [ , endBlock :sup:`= "latest"` ] ] )
    Returns a :ref:`Promise <promise>` with an array of :ref:`Transaction Responses <transaction-response>`
    for each transaction to or from *addressOrName* between *startBlock* and *endBlock* (inclusive).

.. code-block:: javascript
    :caption: *a filtered event has been logged*

    let etherscanProvider = new ethers.providers.EtherscanProvider();

    // Getting the current Ethereum price
    etherscanProvider.getEtherPrice().then(function(price) {
        console.log("Ether price in USD: " + price);
    });


    // Getting the transaction history of an address
    let address = '0xb2682160c482eB985EC9F3e364eEc0a904C44C23';
    let startBlock = 3135808;
    let endBlock = 5091477;
    etherscanProvider.getHistory(address, startBlock, endBlock).then(function(history) {
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
        //     chainId: 0
        //   },
        //   {
        //     hash: '0x7c10f2e7125a1fa5e37b54f5fac5465e8d594f89ff97916806ca56a5744812d9',
        //     ...
        //   }
        // ]
    });

.. _provider-jsonrpc-extra:

JsonRpcProvider
---------------

:sup:`prototype` . send ( method , params ) |nbsp| :sup:`=>` |nbsp| :sup:`Promise<any>`
    Send the JSON-RPC *method* with *params*. This is useful for calling
    non-standard or less common JSON-RPC methods. A :ref:`Promise <promise>` is
    returned which will resolve to the parsed JSON result.

:sup:`prototype` . listAccounts ( ) |nbsp| :sup:`=>` |nbsp| :sup:`Promise<Address [ ] >`
    Returns a :ref:`Promise <promise>` with a list of all account addresses the
    node connected to this Web3 controls.

:sup:`prototype` . getSigner( [ indexOrAddress ] ) |nbsp| :sup:`=>` |nbsp| :sup:`JsonRpcSigner`
    Returns a :ref:`JsonRpcSigner <signer-jsonrpc>` attached to an account on the
    Ethereum node the Web3 object is connected to. If *indexOrAddress* is not specified,
    the first account on the node is used.


.. code-block:: javascript
    :caption: *send vendor specific JSON-RPC API*

    let hash = "0x2ddf6dd2ec23adf525dac59d7c9189b25b172d679aad951e59e232045f2c811f";
    jsonRpcProvider.send('debug_traceTransaction', [ hash ]).then((result) => {
        console.log(result);
    });

.. code-block:: javascript
    :caption: *list accounts and load the second account*

    // Get a signer for the account at index 1
    jsonRpcProvider.listAccounts().then((accounts) => {
        let signer = jsonRpcProvider.getSigner(accounts[1]);
        console.log(signer);
    });

.. _signer-jsonrpc:

JsonRpcSigner
-------------

An account from a JSON-RPC API connection the conforms to the :ref:`Signer API <signer>`.
The :ref:`getSigner <provider-jsonrpc-extra>` method of a JsonRpcProvider should be
used to instantiate these.

:sup:`prototype` . provider
    The provider that this Signer is connected to.

:sup:`prototype` . getAddress ( ) |nbsp| :sup:`=>` |nbsp| :sup:`Promise<Address>`
    Returns a :ref:`Promise <promise>` that resolves to the account address.

:sup:`prototype` . getBalance ( [ blockTag :sup:`= "latest"` ] ) |nbsp| :sup:`=>` |nbsp| :sup:`Promise<BigNumber>`
    Returns a :ref:`Promise <promise>` for the account balance.

:sup:`prototype` . getTransactionCount ( [ blockTag :sup:`= "latest"` ] ) |nbsp| :sup:`=>` |nbsp| :sup:`Promise<number>`
    Returns a :ref:`Promise <promise>` for the account transaction count. This
    can be used to determine the next nonce to use for a transaction.

:sup:`prototype` . sendTransaction ( [ transactionRequest ] ) |nbsp| :sup:`=>` |nbsp| :sup:`Promise<TransactionResponse>`
    Returns a :ref:`Promise <promise>` that resolves to the Transaction Response for
    the sent transaction.

    If an error occurs after the netowrk **may have** received the transaction, the
    promise will reject with the error, with the additional property ``transactionHash``
    so that further processing may be done.

:sup:`prototype` . signMessage ( message ) |nbsp| :sup:`=>` |nbsp| :sup:`Promise<hex>`
    Returns a :ref:`Promise <promise>` that resolves the signature of a signed message, in the
    :ref:`Flat Format <signature>`.

:sup:`prototype` . unlock ( password ) |nbsp| :sup:`=>` |nbsp| :sup:`Promise<boolean>`
    Returns a :ref:`Promise <promise>` the resolves to true or false, depending
    on whether the account unlock was successful.

-----

.. _Ethereum Naming Service: https://ens.domains
.. _Etherscan: https://etherscan.io/apis
.. _web service API: https://etherscan.io/apis
.. _INFURA: https://infura.io
.. _Parity: https://ethcore.io/parity.html
.. _Geth: https://geth.ethereum.org
.. _JSON-RPC API: https://github.com/ethereum/wiki/wiki/JSON-RPC
.. _EventEmitter API: https://nodejs.org/dist/latest-v6.x/docs/api/events.html
.. _replay protection: https://github.com/ethereum/EIPs/issues/155
.. _somewhat complicated: https://github.com/ethereum/wiki/wiki/JSON-RPC#a-note-on-specifying-topic-filters
.. _HTTPProvider: https://github.com/ethereum/web3.js/blob/develop/lib/web3/httpprovider.js
.. _IPCProvider: https://github.com/ethereum/web3.js/blob/develop/lib/web3/ipcprovider.js

.. EOF
