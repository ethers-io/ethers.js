.. _migration:

Migration Guides
****************

Migrating from Web3 to ethers v4
================================

Todo: This is coming soon.

-----

Migrating from ethers v3 to ethers v4
=====================================

A lot of the functionality has remained the same, but there has been some
slight refactoring and improved paradigms.

-----

Constants
---------

All constants have moved from the utils to the root ethers object.

.. code-block:: javascript
    :caption: *Constants --- ethers v3*

    let one = ethers.utils.constants.One;

.. code-block:: javascript
    :caption: *Constants --- ethers v4*

    let one = ethers.constants.One;

-----

Deploying Contracts
-------------------

Deploying contracts has undergone some significant change. The new API is more
seamless and reduces the amount of low-level understanding that is required,
such as the details of how *init transaction* behave.

More complex and complete objects are also returned through-out the
process, so there are far less calls to utility functions after a deployment
required to populate databases and track status.

.. code-block:: javascript
    :caption: *ethers v3*

    let tx = Contract.getDeployTransaction(bytecode, abi, arg1, arg2);

    // overrides
    tx.gasLimit = 1500000;

    wallet.sendTransaction(tx).then((tx) => {
        let contractAddress = ethers.utils.getContractAddress(tx);
        let contract = new ethers.Contract(contractAddress, abi, wallet);
        provider.waitForTransaction(tx).then((tx) => {
            provider.getTransactionReceipt(tx.hash).then((receipt) => {
                if (receipt.status === 0) {
                    throw new Error('failed to deploy');
                }
                contract.someFunction();
            });
        });
    });

.. code-block:: javascript
    :caption: *Deploy a Contract --- ethers v4*

    // Construct a Contract Factory
    let factory = new ethers.ContractFactory(abi, bytecode, signer);

    // Deploy automatically detects gasLimit and all other parameters
    // Overrides can optionally be passed as an extra parameter

    // Optional; all unspecified values will queried from the network
    let overrides = { };

    factory.deploy(arg1, arg2, overrides).then((contract) => {
        // The contract is returned immediately; it has not been mined yet

        // The contract known its address (before it is even mined)
        console.log(contract.address);

        // You can access the in-flight transaction that is currently waiting to be mined
        console.log(contract.deployTransaction);
        // A full transaction with:
        // - from
        // - nonce
        // - hash
        // - all other Transaction Response fields
        // - wait() => Promise that resolves to the TransactionReceipt

        // The "deployed()" function will return a Promise that resolves
        // to the contract, once it has been mined. If the contract fails
        // to deploy, the Promise will reject.
        contract.deployed().then((contract) => {
            // The contract is now deployed
            contract.someFunction();

        }, (error) => {
            // The transaction failed to deploy
            console.log('Failed to deploy in TX:', error.transactionHash);
        });
    });


.. code-block:: javascript
    :caption: *Deploy a Contract with async/await --- ethers v4*

    async function() {
        let factory = new ethers.ContractFactory(abi, bytecode, signer);

        let contract = await factory.deploy(arg1, arg2);

        try {
            await contract.deployed();

        } catch (error) {
            console.log('Failed to deploy in TX:', error.transactionHash);
            throw error;
        }

        contract.someFunction();
    }


.. code-block:: javascript
    :caption: *Get Deployment Transaction --- ethers v4*

    // If you still need the deployment transaction, and don't wish to
    // actually deploy, you can much more easily just use the Interface
    // object without the need for a provider or signer.

    let factory = new ethers.ContractFactory(abi, bytecode);

    let tx = factory.getDeployTransaction(arg1, arg2);

-----

Encrypted Wallets
-----------------

.. code-block:: javascript
    :caption: *Checking JSON Wallets --- ethers v3*

    let isJsonWallet = ethers.Wallet.isEncryptedWallet(json);

.. code-block:: javascript
    :caption: *Checking JSON Wallets --- ethers v4*

    let address = ethers.utils.getJsonWalletAddress(json);
    let isJsonWallet = (address !== null)

.. code-block:: javascript
    :caption: *Decrypting JSON Wallets --- ethers v3*

    let wallet = await ethers.Wallet.fromEncryptedWallet(json, password);

.. code-block:: javascript
    :caption: *Decrypting JSON Wallets --- ethers v4*

    let wallet = await ethers.Wallet.fromEncryptedJson(json, password);


-----

Events
------

Events now behave like a modern JavaScript Event Emitter, rather than a 1995
web browser.

The events now play nicer with the arrow operator (i.e. ``() => { ... }``),
since rather than modifying the `this` inside the callbacks, an additional
rich object is passed along.

.. code-block:: javascript
    :caption: *Events --- ethers v3*

    // Solidity: event SomeEvent(address foo, uint256 bar)
    contract.onsomeevent = function(foo, bar) {
        console.log(foo, bar);
        // The Log was available at this:
        // - this.event
        // - this.removeListener()
    };

.. code-block:: javascript
    :caption: *Listening to an Event --- ethers v4*

    // Solidity: event SomeEvent(address foo, uint256 bar)
    contract.on('SomeEvent', (foo, bar, eventInfo) => {
        console.log(foo, bar);
        // eventInfo
        //  - Log (blockNumber, blockHash, txHash, removed, address, data, etc.)
        //  - args: [ foo, bar ]
        //  - decode: (data, topics) => [ foo, bar ]
        //  - event: "SomeEvent"
        //  - eventSignature: "SomeEvent(address,uint256)"
        //  - removeListener: () => removes this listener
        //  - getBlock: () => returns a Promise of the block
        //  - getTransaction: () => returns a Promise of transaction
        //  - getTransactionReceipt: () => returns a Promise of the receipt
    });

.. code-block:: javascript
    :caption: *Indexed Events --- ethers v3*

    // Detecting a parameters is an indexed hash, and not a value
    contract.someEvent = function(foo) {
        if (foo.indexed) {
            // The value is just a hash to filter by
        }
    }

.. code-block:: javascript
    :caption: *Indexed Events --- ethers v4*

    let Indexed = ethers.types.Indexed;

    // Detecting a parameters is an indexed hash, and not a value
    contract.someEvent = function(foo) {
        if (Indexed.isIndexed(foo)) {
            // The value is just a hash to filter by
        }
    }

.. code-block:: javascript
    :caption: *Filtering Events --- ethers v4*

    // Solidity: event SomeEvent(address indexed foo, uint256 bar)
    let address = '0x8B40a2E27C5E87aa66DfA7F80BF675176F49DCA7';
    let filter = contract.filters.SomeEvent(address, null);

    console.log(filter);
    // {
    //    address: contract.address,
    //    topics: [
    //        0xdde371250dcd21c331edbb965b9163f4898566e8c60e28868533281edf66ab03,
    //        0x0000000000000000000000008b40a2e27c5e87aa66dfa7f80bf675176f49dca7
    //    ]
    // }

    contract.on(filter, (foo, bar, eventInfo) => {
        console.log(foo === address);
        // true
    });


If there are multiple events with the same name:

.. code-block:: javascript
    :caption: *Event Name Collision --- ethers v4*

    // Solidity
    // - event SomeEvent(address foo, uint256 bar)
    // - event SomeEvent(address foo, address bar)

    contract.on('SomeEvent(address, uint256)', (foo, bar, eventInfo) => {
        // ...
    });

    contract.on('SomeEvent(address, address)', (foo, bar, eventInfo) => {
        // ...
    });


-----

Fetching JSON
-------------

The JSON fetching routine, since it was mostly used for Providers was
on the Provider object in v3. In v4, it has moved to utils, since there
are other common cases where it may be useful.

.. code-block:: javascript
    :caption: *Fetching JSON --- ethers v3*

    ethers.providers.Provider.fetchJson(url).then((object) => {
        // ...
    });

.. code-block:: javascript
    :caption: *Fetching JSON --- ethers v4*

    ethers.utils.fetchJson(url).then((object) => {
        // ...
    });

-----

Interfaces
----------

This has always been a fairly low-level API, and mostly available for
framework developers and other tools that require quite specific access
to working with an ABI. Most of the changes are to simplify the interaction,
so while there will probably be changes required, if you use this class, the
complexity and size of your code should be reduced.

.. code-block:: javascript
    :caption: *Interface --- ethers v3*

    let iface = ethers.Interface(address, abi, providerOrSigner);

.. code-block:: javascript
    :caption: *Interface --- ethers v4*

    let iface = ethers.utils.Interface(address, abi, providerOrSigner);

.. code-block:: javascript
    :caption: *Function Description --- ethers v3*

    let address = "0x8B40a2E27C5E87aa66DfA7F80BF675176F49DCA7";
    let value = 1000;

    // Solidity: function someFunc(address foo, uint256 bar) constant returns (address result)
    let functionCallable = iface.functionst.someFunc
    // functionInfo
    // - inputs: { names: [ "foo", "bar" ], types: [ "address", "uint256" ] }
    // - outputs: { names: [ "result" ], types: [ "address" ] }
    // - payable: false
    // - parseResult: (data) => any
    // - signature: "someFunc(address,uint256)"
    // - sighash: "0xd90a6a67"

    let data = functionCallable(address, value);
    let result = functionCallable.parseResult(callResultData);

.. code-block:: javascript
    :caption: *Function Description --- ethers v4*

    let address = "0x8B40a2E27C5E87aa66DfA7F80BF675176F49DCA7";
    let value = 1000;

    // Solidity: function someFunc(address foo, uint256 bar) constant returns (address result)
    let functionInfo = iface.functions.someFunc;
    // functionInfo
    // - type: "call" (or "transaction" for non-constant functions)
    // - name: "someFunc"
    // - signature: "someFunc(address,uint256)"
    // - sighash: "0xd90a6a67"
    // - inputs: [ { name: foo", type: "bar" }, { name: "bar", type: "uint256" } ]
    // - outputs: [ { name: "result", type: "address" } ]
    // - payable: false
    // - encode: (params) => string
    // - decode: (data) => any

    // Note: This takes in an array; it no longer uses ...args
    let data = functionInfo.encode([ address, value ]);
    let result = functionInfo.decode(callResultData);

.. code-block:: javascript
    :caption: *Event Description --- ethers v3*

    // Solidity: event SomeEvent(address foo, uint256 bar)
    let eventInfo = iface.events.SomeEvent;
    // eventInfo
    // - topics: [ ethers.utils.id("SomeEvent(address,uint256)") ]
    // - anonymous: false
    // - name: "SomeEvent"
    // - signature: "SomeEvent(address,uint256)"
    // - type: "event"
    // - inputs: { names: [ 'foo', 'bar' ], types: [ 'address', 'uint256' ] }
    // - parse: (topics, data) => Result

.. code-block:: javascript
    :caption: *Event Description --- ethers v4*

    // Solidity: event SomeEvent(address foo, uint256 bar)
    let eventInfo = iface.events.SomeEvent;
    // eventInfo
    // - name: "SomeEvent"
    // - signature: "SomeEvent(address,bar)"
    // - inputs: [ { name: "foo", type: "address" }, { name: "bar", type: "uint256" } ]
    // - anonymous: false
    // - topic: ethers.utils.id("SomeEvent(address,uint256)")
    // - encodeTopics: (Array<any>) => Array<string>
    // - decode: (data, topics) => Result

    // Create event filter topics
    let address = '0x8B40a2E27C5E87aa66DfA7F80BF675176F49DCA7';
    eventInfo.encodeTopics(address, null)
    // topics: [
    //   "0xdde371250dcd21c331edbb965b9163f4898566e8c60e28868533281edf66ab03",
    //   "0x0000000000000000000000008b40a2e27c5e87aa66dfa7f80bf675176f49dca7"
    // ]


-----

Networks
--------

.. code-block:: javascript
    :caption: *Getting Network Info - ethers v3*

    let network = ethers.providers.getNetwork('ropsten')

.. code-block:: javascript
    :caption: *Getting Network Info - ethers v4*

    let network = ethers.utils.getNetwork('ropsten');

    // Networks may now also be found by their network ID
    let network = ethers.utils.getNetwork(3);

    // And networks can be validated as an object
    let network = ethers.utils.getNetwork({ name: "custom", chainId: 1337 });

    // Validation fails; this will throw an error, since Rinkeby is not
    // chain ID 1 (homestead is)
    let network = ethers.utils.getNetwork({ name: "rinkeby", chainId: 1 });

-----

Parsing Transactions
--------------------

The transaction parsing was moved out of the Wallet and into its own class
in the utilities, along with a general serialization API.

.. code-block:: javascript
    :caption: *ethers v3*

    let tx = ethers.Wallet.parseTransaction(rawTransaction);

.. code-block:: javascript
    :caption: *ethers v4*

    let tx = ethers.utils.parseTransaction(rawTransaction);

-----

Custom Signer
-------------

.. code-block:: javascript
    :caption: *Custome Signer --- ethers v3*

    let signer = {
        // Required
        getAddress: function() { ... },
        provider: provider,

        // Optional
        estimateGas: function(tx) { ... },
        sendTransaction: function(tx) { ... },
        sign: function(tx) { ... },
    };

.. code-block:: javascript
    :caption: *Custom Signer --- JavaScript --- ethers v4*

    function CustomSigner {
        ethers.Signer.call(this);

        // Optional
        this.provider = provider;
    }
    inherits(CustomSigner, ethers.Signer);

    // Required
    CustomSigner.prototype.getAddress = () => { ... };
    CustomSigner.prototype.sendTransaction = (tx) => { ... };
    CustomSigner.prototype.signMessage = (message) => { ... };

    // Optional
    CustomSigner.prototype.connect = (provider) => { ... };

.. code-block:: javascript
    :caption: *Custom Signer --- TypeScript --- ethers v4*

    import {
        Signer,
        utils
    } from 'ethers';

    import {
        Provider,
        TransactionRequest,
        TransactionReqponse
    } from 'ethers/providers';

    class CustomSigner extends Signer {
        this.provider = provider;
        readony provider: Provider;
        constructor(provider) {
             super();

             // Optional
             this.provider = // ...
        }

        getAddress() {
            // Return a promise to the address
        };

        sendTransaction = (transaction: TransactionRequest): Promise<TransaxctinResponse> {
            // This will popualte missing properties, like nonce, gasLimit, etc
            return utils.populateTransaction(transaction).then((tx) => {
                 // Send the transaction and resolve the transaction
            });
        };

        signMessage(message: string | ethers.utils.Arrayish): Promise<string> {
            let dataToSign: Uint8Array = utils.hashMessage(message);;
            // Sign ths dataToSign and resolve teh flat-format signature
        };

        // Optional; highly recommended
        connect(provider: Provider): CustomSigner {
            return new CustomSigner(provider);
        }
    }


-----

Default Provider
----------------

.. code-block:: javascript
    :caption: *Default Provider --- ethers v3*

    let provider = ethers.providers.getDefaultProvider();

.. code-block:: javascript
    :caption: *Default Provider --- ethers v4*

    let provider = ethers.getDefaultProvider();

-----

Big Number
----------

.. code-block:: javascript
    :caption: *isBigNumber --- ethers v3*

    let checkBigNumber = ethers.utils.isBigNumber(value);

.. code-block:: javascript
    :caption: *isBigNumber --- ethers v4*

    let checkBigNumber = BigNumber.isBigNumber(value);

-----

JsonRpcProvider
----------------

.. code-block:: javascript
    :caption: *Connecting --- ethers v3*

    let url = "http://localhost:8545";
    let network = "rinkeby";
    let provider = new ethers.providers.JsonRpcProvider(url, network);

    // Even if the network was wrong, this would mostly seem to work and
    // fail once the chain ID was attempted

    // The network was a synchronous property on Provider
    let network = provider.network;

.. code-block:: javascript
    :caption: *Connecting --- ethers v4*

    // In v4, the network is automatically determined; you may override
    // the network, but it must match, or it will fail early

    let url = "http://localhost:8545";
    let provider = new ethers.providers.JsonRpcProvider(url);

    // The network is now an asynchronous property:
    provider.getNetwork().then((network) => {
        // ...
    });

    // One useful and common exception it that, if any async call from
    // the provider has ever succeeded, the synchronous network property
    // is then valid. The network property is populated before any
    // async call is made, so once an async call has finished, the network
    // property is available synchronously.

    async function() {
        await provider.getBlockNumber();

        let network = provider.network;
    }

.. code-block:: javascript
    :caption: *Sending Transactions --- ethers v3*

    provider.sendTransaction(rawTransaction).then((hash) => {
        // Just a transaction hash
    });

.. code-block:: javascript
    :caption: *Sending Transactions --- ethers v4*

    provider.sendTransaction(rawTransaction).then((transaction) => {
        // A full Transaction Response is returned
        // - from
        // - to
        // - gasLimit, gasPrice
        // - nonce
        // - r, s, v
        // - wait() => Promise that resolves the Transaction Receipt once mined
        //             and rejects with an error is the stats is 0; the error
        //             will have a transactionHash property as well as a
        //             transaction property.

        let hash = transaction.hash;
    });

-----

Verifying Messages
------------------

The message verification was moved from a static class on the Wallet to the
utilities, along with a few other functions of the elliptic curve cryptographic
exposed.

.. code-block:: javascript
    :caption: *ethers v3*

    let signingAddress = ethers.Wallet.verifyMessage(message, signature);

.. code-block:: javascript
    :caption: *ethers v4*

    let signingAddress = ethers.utils.verifyMessage(message, signature);

-----

Waiting for Transactions
------------------------

In v3, the ``transaction.wait()`` returned a Promise which would resolve to the
**TransactionResponse** once it is mined.

In v4, the ``transaction.wait()`` returned a Promise which would resolve to the
**TransactionReceipt** once it is mined.

-----

.. eof
