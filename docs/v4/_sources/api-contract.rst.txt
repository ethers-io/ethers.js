.. |nbsp| unicode:: U+00A0 .. non-breaking space

.. _api-contract:

Contracts
*********

A Contract is an abstraction of an executable program on the Ethereum Blockchain. A
Contract has code (called byte code) as well as allocated long-term memory (called
storage). Every deployed Contract has an address, which is used to connect to it
so that it may be sent messages to call its methods.

A Contract can emit **Events**, which can be efficiently observed by applications to
be notified when a contract has performed specific operation. Events cannot be read
by a Contract.

There are two types of methods that can be called on a Contract:

    A **Constant** method may not add, remove or change any data in the storage, nor
    log any events, and may only call **Constant** methods on other contracts. These
    methods are free (**no** *Ether* is required) to call. The result from them may also
    be returned to the caller.

    A **Non-Constant** method requires a fee (in *Ether*) to be paid, but may perform any
    state-changing operation desired, log events, send ether and call **Non-Constant**
    methods on other Contracts. These methods **cannot** return their result to the caller.
    These methods must be triggered by a transaction, sent by an Externally Owned Account (EOA)
    either directly or indirectly (i.e. called from another contract), and are required
    to be mined before the effects are present. Therefore, the duration required for these
    operations can vary widely, and depend on the transaction gas price, network congestion and
    miner priority heuristics.

The Contract API provides simple way to connect to a Contract and call its methods,
as functions on a JavaScript object, handling all the binary protocol conversion,
internal name mangling and topic construction. This allows a Contract object to be
used like any standard JavaScript object, without having to worry about the
low-level details of the Ethereum Virtual Machine or Blockchain.

The Contract object is a meta-class, which is a class that defines a Class at
run-time. The Contract definition (called an **Application Binary Interface**, or ABI)
can be provided and the available methods and events will be dynamically added to
the object.

Throughout this document, we will refer to the following Contract.

.. code-block:: javascript
    :caption: *SimpleStorage Contract*

    pragma solidity ^0.4.24;

    contract SimpleStorage {

        event ValueChanged(address indexed author, string oldValue, string newValue);

        string _value;

        constructor(string value) public {
            emit ValueChanged(msg.sender, _value, value);
            _value = value;
        }

        function getValue() view public returns (string) {
            return _value;
        }

        function setValue(string value) public {
            emit ValueChanged(msg.sender, _value, value);
            _value = value;
        }
    }

-----

.. _contract-deployment:

Deploying a Contract
====================

To deploy a contract to the Ethereum network, a **ContractFactory** can be created
which manages the Contract bytecode and **Application Binary Interface** (ABI),
usually generated from the *Solidity* compiler.

Creating a Contract Factory
---------------------------

new :sup:`ethers` . ContractFactory ( abi , bytecode [ , signer ] )
    Creates a factory for deployment of the Contract with *bytecode*, and the
    constructor defined in the *abi*. The *signer* will be used to send
    any deployment transaction.

:sup:`ethers` . ContractFactory . fromSolidity ( compilerOutput [ , signer ] )
    Creates a ContractFactory from the *compilerOutput* of the *Solidity*
    compiler or from the *Truffle* JSON.
    (i.e. ``output.contracts['SimpleStorage.sol'].SimpleStorage``)

:sup:`prototype` . connect ( signer ) |nbsp| :sup:`=>` |nbsp| :sup:`ContractFactory`
    Create a **new instance** of the ContractFactory, connected to the new *signer*.


Prototype
---------

:sup:`prototype` . bytecode
    The Contract executable byte code..

:sup:`prototype` . interface
    The Contract Application Binary Interface (ABI).

:sup:`prototype` . signer
    The :ref:`Signer <signer>` that will be used to send transactions to the network.
    If this is null, ``deploy()`` cannot be called.


Connecting
----------

:sup:`prototype` . attach ( address ) |nbsp| :sup:`=>` |nbsp| :sup:`Contract`
    Connect to an existing instance of this Contract at *address* using the
    Contract Interface and Signer.


Deployment
----------

:sup:`prototype` . deploy ( ... ) |nbsp| :sup:`=>` |nbsp| :sup:`Promise<Contract>`
    Creates a transaction to deploy the transaction and
    sends it to the network using the contract :ref:`Signer <signer>`, returning a
    :ref:`Promise <promise>` that resolves to a Contract. The transaction is available
    as contract.deployTransaction.

    Keep in mind that the Contract may not be mined immediately. The
    ``contract.deployed()`` function will return a :ref:`Promise <promise>`
    which will resolve once the contract is deployed, or reject if there
    was an error during deployment.

:sup:`prototype` . getDeployTransaction ( ... ) |nbsp| :sup:`=>` |nbsp| :sup:`UnsignedTransaction`
    Returns the transaction required to deploy the Contract with the provided
    constructor arguments. This is often useful for signing offline transactions or
    analysis tools.

.. code-block:: javascript
    :caption: *Deploy a Contract*

    const ethers = require('ethers');

    // The Contract interface
    let abi = [
        "event ValueChanged(address indexed author, string oldValue, string newValue)",
        "constructor(string value)",
        "function getValue() view returns (string value)",
        "function setValue(string value)"
    ];

    // The bytecode from Solidity, compiling the above source
    let bytecode = "0x608060405234801561001057600080fd5b506040516105bd3803806105bd8339" +
                     "8101604081815282518183526000805460026000196101006001841615020190" +
                     "91160492840183905293019233927fe826f71647b8486f2bae59832124c70792" +
                     "fba044036720a54ec8dacdd5df4fcb9285919081906020820190606083019086" +
                     "9080156100cd5780601f106100a2576101008083540402835291602001916100" +
                     "cd565b820191906000526020600020905b815481529060010190602001808311" +
                     "6100b057829003601f168201915b505083810382528451815284516020918201" +
                     "9186019080838360005b838110156101015781810151838201526020016100e9" +
                     "565b50505050905090810190601f16801561012e578082038051600183602003" +
                     "6101000a031916815260200191505b5094505050505060405180910390a28051" +
                     "610150906000906020840190610157565b50506101f2565b8280546001816001" +
                     "16156101000203166002900490600052602060002090601f0160209004810192" +
                     "82601f1061019857805160ff19168380011785556101c5565b82800160010185" +
                     "5582156101c5579182015b828111156101c55782518255916020019190600101" +
                     "906101aa565b506101d19291506101d5565b5090565b6101ef91905b80821115" +
                     "6101d157600081556001016101db565b90565b6103bc806102016000396000f3" +
                     "0060806040526004361061004b5763ffffffff7c010000000000000000000000" +
                     "0000000000000000000000000000000000600035041663209652558114610050" +
                     "57806393a09352146100da575b600080fd5b34801561005c57600080fd5b5061" +
                     "0065610135565b60408051602080825283518183015283519192839290830191" +
                     "85019080838360005b8381101561009f57818101518382015260200161008756" +
                     "5b50505050905090810190601f1680156100cc57808203805160018360200361" +
                     "01000a031916815260200191505b509250505060405180910390f35b34801561" +
                     "00e657600080fd5b506040805160206004803580820135601f81018490048402" +
                     "8501840190955284845261013394369492936024939284019190819084018382" +
                     "80828437509497506101cc9650505050505050565b005b600080546040805160" +
                     "20601f6002600019610100600188161502019095169490940493840181900481" +
                     "0282018101909252828152606093909290918301828280156101c15780601f10" +
                     "610196576101008083540402835291602001916101c1565b8201919060005260" +
                     "20600020905b8154815290600101906020018083116101a457829003601f1682" +
                     "01915b505050505090505b90565b604080518181526000805460026000196101" +
                     "00600184161502019091160492820183905233927fe826f71647b8486f2bae59" +
                     "832124c70792fba044036720a54ec8dacdd5df4fcb9285918190602082019060" +
                     "60830190869080156102715780601f1061024657610100808354040283529160" +
                     "200191610271565b820191906000526020600020905b81548152906001019060" +
                     "200180831161025457829003601f168201915b50508381038252845181528451" +
                     "60209182019186019080838360005b838110156102a557818101518382015260" +
                     "200161028d565b50505050905090810190601f1680156102d257808203805160" +
                     "01836020036101000a031916815260200191505b509450505050506040518091" +
                     "0390a280516102f49060009060208401906102f8565b5050565b828054600181" +
                     "600116156101000203166002900490600052602060002090601f016020900481" +
                     "019282601f1061033957805160ff1916838001178555610366565b8280016001" +
                     "0185558215610366579182015b82811115610366578251825591602001919060" +
                     "01019061034b565b50610372929150610376565b5090565b6101c991905b8082" +
                     "1115610372576000815560010161037c5600a165627a7a723058202225a35c50" +
                     "7b31ac6df494f4be31057c7202b5084c592bdb9b29f232407abeac0029";


    // Connect to the network
    let provider = ethers.getDefaultProvider('ropsten');

    // Load the wallet to deploy the contract with
    let privateKey = '0x0123456789012345678901234567890123456789012345678901234567890123';
    let wallet = new ethers.Wallet(privateKey, provider);

    // Deployment is asynchronous, so we use an async IIFE
    (async function() {

        // Create an instance of a Contract Factory
        let factory = new ethers.ContractFactory(abi, bytecode, wallet);

        // Notice we pass in "Hello World" as the parameter to the constructor
        let contract = await factory.deploy("Hello World");

        // The address the Contract WILL have once mined
        // See: https://ropsten.etherscan.io/address/0x2bd9aaa2953f988153c8629926d22a6a5f69b14e
        console.log(contract.address);
        // "0x2bD9aAa2953F988153c8629926D22A6a5F69b14E"

        // The transaction that was sent to the network to deploy the Contract
        // See: https://ropsten.etherscan.io/tx/0x159b76843662a15bd67e482dcfbee55e8e44efad26c5a614245e12a00d4b1a51
        console.log(contract.deployTransaction.hash);
        // "0x159b76843662a15bd67e482dcfbee55e8e44efad26c5a614245e12a00d4b1a51"

        // The contract is NOT deployed yet; we must wait until it is mined
        await contract.deployed()

        // Done! The contract is deployed.
    })();


-----

Connecting to Existing Contracts
=================================

Once a Contract has been deployed, it can be connected to using
the **Contract** object.

Connecting to a Contract
------------------------

new :sup:`ethers` . Contract ( addressOrName , abi , providerOrSigner )
    Connects to the contract at *addressOrName* defined by *abi*, connected as *providerOrSigner*.

    For supported formats for *abi*, see :ref:`Contract ABI <contract-abi>`.

    For access capabilities and restrictions, see :ref:`Providers vs Signers <providers-vs-signers>`

.. code-block:: javascript
    :caption: *Connecting to an existing Contract*

    const ethers = require('ethers');

    // The Contract interface
    let abi = [
        "event ValueChanged(address indexed author, string oldValue, string newValue)",
        "constructor(string value)",
        "function getValue() view returns (string value)",
        "function setValue(string value)"
    ];

    // Connect to the network
    let provider = ethers.getDefaultProvider();

    // The address from the above deployment example
    let contractAddress = "0x2bD9aAa2953F988153c8629926D22A6a5F69b14E";

    // We connect to the Contract using a Provider, so we will only
    // have read-only access to the Contract
    let contract = new ethers.Contract(contractAddress, abi, provider);


.. code-block:: javascript
    :caption: *Calling a read-only Constant Method*

    // Get the current value
    let currentValue = await contract.getValue();

    console.log(currentValue);
    // "Hello World"

.. code-block:: javascript
    :caption: *Calling a Non-Constant Method*

    // A Signer from a private key
    let privateKey = '0x0123456789012345678901234567890123456789012345678901234567890123';
    let wallet = new ethers.Wallet(privateKey, provider);

    // Create a new instance of the Contract with a Signer, which allows
    // update methods
    let contractWithSigner = contract.connect(wallet);
    // ... OR ...
    // let contractWithSigner = new Contract(contractAddress, abi, wallet)

    // Set a new Value, which returns the transaction
    let tx = await contractWithSigner.setValue("I like turtles.");

    // See: https://ropsten.etherscan.io/tx/0xaf0068dcf728afa5accd02172867627da4e6f946dfb8174a7be31f01b11d5364
    console.log(tx.hash);
    // "0xaf0068dcf728afa5accd02172867627da4e6f946dfb8174a7be31f01b11d5364"

    // The operation is NOT complete yet; we must wait until it is mined
    await tx.wait();

    // Call the Contract's getValue() method again
    let newValue = await contract.getValue();

    console.log(currentValue);
    // "I like turtles."

.. code-block:: javascript
    :caption: *Listening to Events*

    contract.on("ValueChanged", (author, oldValue, newValue, event) => {
        // Called when anyone changes the value

        console.log(author);
        // "0x14791697260E4c9A71f18484C9f997B308e59325"

        console.log(oldValue);
        // "Hello World"

        console.log(newValue);
        // "Ilike turtles."

        // See Event Emitter below for all properties on Event
        console.log(event.blockNumber);
        // 4115004
    });

.. code-block:: javascript
    :caption: *Filtering an Events*

    // A filter that matches my Signer as the author
    let filter = contract.filters.ValueChanged(wallet.address);

    contract.on(filter, (author, oldValue, newValue, event) => {
        // Called ONLY when your account changes the value
    });

-----

Prototype
---------

:sup:`prototype` . address
    The address (or ENS name) of the contract.

:sup:`prototype` . deployTransaction
    If the contract was deployed by a ContractFactory, this is the transaction
    used to deploy it, otherwise it is null.

:sup:`prototype` . interface
    The :ref:`Interface <api-interface>` meta-class of the parsed
    ABI. Generally, this should not need to be accessed directly.

Additional properties will be added to the prototype at run-time, based on
the ABI provided, see :ref:`Contract Meta-Class <contract-metaclass>`.

-----

Waiting for Deployment
----------------------

:sup:`prototype` . deployed ( ) |nbsp| :sup:`=>` |nbsp| :sup:`Promise<Contract>`
    If the contract is the result of ``deploy()``, returns
    a :ref:`Promise <promise>` that resolves to the contract once it
    has been mined, or rejects if the contract failed to deploy. If the
    contract has been deployed already, this will return a
    :ref:`Promise <promise>` that resolves once the on-chain code has
    been confirmed.

-----

.. _contract-metaclass:

Meta-Class Properties
=====================

Since a Contract is dynamic and loaded at run-time, many of the properties
that will exist on a Contract are determined at run-time from
the :ref:`Contract ABI <contract-abi>`.

Contract Methods
----------------

All functions populated from the ABI are also included on the contract object
directly, for example ``contract.functions.getValue()`` can also be called
using ``contract.getValue()``.

:sup:`prototype` . functions . *functionName*
    An object that maps each ABI function name to a function that will
    either call (for constant functions) or sign and send a transaction
    (for non-constant functions)

    Calling a **Constant** function requires either a :ref:`Provider <provider-connect>` or
    a Signer with a :ref:`Provider <provider-connect>`.

    Calling a **Non-Constant** function (i.e. sending a transaction) requires a
    :ref:`Signer <signer>`.

:sup:`prototype` . estimate . *functionName*
    An object that maps each ABI function name to a function that will
    estimate the cost the provided parameters.


Contract Event Filters
----------------------

Filters allow for a flexible and efficient way to fetch only a subset of the
events that match specific criteria. The ``filters`` property contains a
function for every Event in the ABI that computes a Filter for a given
set of values. The ``null`` matches any value.

:sup:`prototype` . filters . *eventname*
    A function that generates filters that can be listened to, using the
    ``on(eventName, ...)`` function, filtered by the Event values.

.. code-block:: javascript
    :caption: *Filtering Events*

    // A filter from me to anyone
    let filterFromMe = contract.filters.Transfer(myAddress);

    // A filter from anyone to me
    let filterToMe = contract.filters.Transfer(null, myAddress);

    // A filter from me AND to me
    let filterFromMeToMe = contract.filters.Transfer(myAddress, myAddress);

    contract.on(filterFromMe, (fromAddress, toAddress, value, event) => {
        console.log('I sent', value);
    });

    contract.on(filterToMe, (fromAddress, toAddress, value, event) => {
        console.log('I received', value);
    });

    contract.on(filterFromMeToMe, (fromAddress, toAddress, value, event) => {
        console.log('Myself to me', value);
    });


-----

.. _contract-overrides:

Overrides
=========

Every Contract method may take one additional (optional) parameter which specifies the
transaction (or call) overrides.

.. code-block:: javascript
    :caption: *Contract Transaction Overrides*

    // All overrides are optional
    let overrides = {

        // The maximum units of gas for the transaction to use
        gasLimit: 23000,

        // The price (in wei) per unit of gas
        gasPrice: utils.parseUnits('9.0', 'gwei'),

        // The nonce to use in the transaction
        nonce: 123,

        // The amount to send with the transaction (i.e. msg.value)
        value: utils.parseEther('1.0'),

        // The chain ID (or network ID) to use
        chainId: 1

    };

    // Solidity: function someFunction(address addr) public
    let tx = contract.someFunction(addr, overrides)

.. code-block:: javascript
    :caption: *Contract Call Overrides*

    let overrides = {

        // The address to execute the call as
        from: "0x0123456789012345678901234567890123456789",

        // The maximum units of gas for the transaction to use
        gasLimit: 23000,

    };

    // Solidity: function someFunction(address addr) public pure returns (bytes32 result)
    let result = contract.someFunction(addr, overrides)

-----

.. _contract-event-emitter:

Event Emitter
=============

Each Contract supports many of the operations available from the `Event Emitter API`_.

To listen for Events, the contract requires either a :ref:`Provider <provider-connect>` or
a Signer with a :ref:`Provider <provider-connect>`.


Event Names
-----------

The available eventNames are:

    - **string** -- The name of an event (e.g. "TestEvent" or "TestEvent(string, uint)")
    - **filter** -- See :ref:`Contract Filters <contract-filter>`
    - **\*** -- All events


Event Object
------------

All event callbacks receive the parameters specified in the ABI as well as one additional
Event Object with

    - **blockNumber**, **blockHash**, **transactionHash** -- The Block and Transaction of the Log
    - **address** -- The contract address for the Log
    - **data** -- The Log data
    - **topics** -- An array of the Log topics
    - **args** -- An array of the parsed  arguments for the event
    - **event** -- the name of the event (e.g. "Transfer")
    - **eventSignature** -- the full signature of the event (e.g. "Transfer(address,address,uint256)")
    - **getBlock()** -- A function that resolves to the Block containing the Log
    - **getTransaction()** -- A function that resolves to the Transaction containing the Log
    - **getTransactionReceipt()** -- A function that resolves to the Transaction Receipt containing the Log
    - **removeListener()** -- A function that removes this callack as a listener
    - **decode(data, topics)** -- A function that decodes data and topics into parsed arguments


Configuring Events
------------------

:sup:`prototype` . on ( eventName , callback ) |nbsp| :sup:`=>` |nbsp| :sup:`Contract`
    Registers *callback* to be called on every *eventName*. Returns the contract, so calls may be chained.

:sup:`prototype` . addListner ( eventName , callback ) |nbsp| :sup:`=>` |nbsp| :sup:`Contract`
    An alias for ``on``.

:sup:`prototype` . once ( eventName , callback ) |nbsp| :sup:`=>` |nbsp| :sup:`Contract`
    Register *callback* to be called at most once, for *eventName*. Returns the contract, so calls may be chained.

:sup:`prototype` . emit ( eventName , ... ) |nbsp| :sup:`=>` |nbsp| :sup:`boolean`
    Trigger all callbacks for *eventName*, returning true if there was at
    least one listener. This should generally not be called directly.

:sup:`prototype` . listenerCount ( [ eventName ] ) |nbsp| :sup:`=>` |nbsp| :sup:`number`
    Returns the number of callbacks registered for *eventName*.

:sup:`prototype` . listeners ( eventName ) |nbsp| :sup:`=>` |nbsp| :sup:`Listeners[]`
    Returns a list of callbacks for *eventName*.

:sup:`prototype` . removeAllListeners ( eventName ) |nbsp| :sup:`=>` |nbsp| :sup:`Contract`
    De-registers all listeners for *eventName*. Returns the contract, so calls may be chained.

:sup:`prototype` . removeListener ( eventName , callback ) |nbsp| :sup:`=>` |nbsp| :sup:`Contract`
    De-registers the specific *callback* for *eventName*. Returns the contract, so calls may be chained.

.. code-block:: javascript
    :caption: *Events*

    contract.on("ValueChanged", (oldValue, newValue, event) => {
        console.log(oldValue, newValue);
    });


-----

.. _providers-vs-signers:

Providers vs Signers
====================

A Contract object has a notion of an "frame of reference", which will determine
what type of access and whom the Contract is enacted upon as. This is specified
by the **providerOrSigner** parameter when connecting to a Contract.

There are three possible cases for connecting a Contract using the providerOrSigner.

============================================ ========================================
providerOrSigner                             Operation Privileges
============================================ ========================================
:ref:`Provider <provider-connect>`           Read-Only Access
:ref:`Signer <signer>` (without a provider)  Write-Only Access (as account owner)
:ref:`Signer <signer>` (with a provider)     Read and Write Access (as account owner)
============================================ ========================================

The **providerOrSigner** is immutable, so to change the "frame of reference" to
another account or provider, use the ``connect`` function.

:sup:`prototype` . connect ( providerOrSigner )
    Create a **new instance** of the Contract object connected as *providerOrSigner*.


Types
=====

There are many variable types available in *Solidity*, some which convert
to and from JavaScript gracefully, and others that do not. Here are some
note regarding passing and returning values in Contracts.


Bytes
-----

Bytes are available in fixed-length or dynamic-length variants. In both cases, the
values are returned as a hex string and may be passed in as either a hex string or
as an :ref:`arrayish <arrayish>`.

To convert the string into an array, use the :ref:`arrayify() <arrayish>` utility function.


Integers
--------

Integers in *solidity* are a fixed number of bits (aligned to the nearest byte)
and are available in signed and unsigned variants.

For example, a **uint256** is 256 bits (32 bytes) and unsigned. An **int8**
is 8 bits (1 byte) and signed.

When the type is 48 bits (6 bytes) or less, values are returned as a JavaScript
Number, since Javascript Numbers are safe to use up to 53 bits.

Any types with 56 bits (7 bytes) or more will be returned as a BigNumber,
even if the *value* is within the 53 bit safe range.

When passing numeric values in, JavaScript Numbers, hex strings or any BigNumber
is acceptable (however, take care when using JavaScript Numbers and performing
mathematical operations on them).

The **uint** and **int** types are aliases for **uint256** and **int256**,
respectively.


Strings
-------

For short strings, many Contracts use a bytes32 to encode a null-terminated
string representation, rather than a length-prefixed representation, so the
:ref:`formatBytes32String <bytes32string>` and :ref:`parseBytes32String <bytes32string>`
utility functions can be used to handle this conversion.

To convert between the two dynamic types, strings and bytes, the
:ref:`toUtf8Bytes() <utf8-strings>` and :ref:`toUtf8String() <utf8-strings>`
utility functions can be used.


Structs
-------

Structs can be specified as Objects with their named properties, or as an Array,
the same length as the struct.

**Constant** methods which return a single item, return that item directly. If the
method returns multiple values then an object is returned which can be accessed by
either the named properties or by their indices, in which case both point to the
**same instance**.


.. code-block:: javascript
    :caption: *Example Return Types*

    /**
     *  Contract Methods
     *
     *  function oneItem() public view returns (uint256 param1);
     *  function twoItems() public view returns (uint256 param1, uint256 param2);
     *
     */

     let resultOne = await oneItem();
     console.log(resultOne);
     // 1337

     let resultTwo = await twoItems();
     console.log(resultTwo);
     // {
     //    "param1": 1337,
     //    "param2": 42,
     //    0: 1337,
     //    1: 42,
     //    length: 2
     // }

     assert.ok(resultTwo[0] === resultTwo.param1);
     assert.ok(resultTwo[1] === resultTwo.param2);


-----

.. _contract-filter:

Filtering Events
================

On every contract, there is a ``filters`` property, which can be used to
generate an event filter. And event filter can be passed into the ``on(eventName)``
of a contract.

.. code-block:: javascript
    :caption: *Find all ERC-20 transfers to myAddress*

    // The null field indicates any value matches, this specifies
    // "any Transfer from any to myAddress"
    let filter = contract.filters.Transfer(null, myAddress);

    // Listen for our filtered results
    contract.on(filter, (from, to, value) => {
        console.log('I received ' + value.toString() + ' tokens from ' + from);
    });

-----

.. _contract-abi:

Application Binary Interface (ABI)
==================================

Each Contract has a description of its interface, which describes each function
and event.

The Solidity compiler generates the ABI in a JSON format, which can be used as
a JSON string or parsed as a JavaScript Object. This is generated by the
compiler and can be loaded as a file, or copied into the source code.

The ABI may also be specified using `Human-Readable ABI`_, which is much easier
to use when typing in an ABI by hand, for example, as well as easier to read. This
is simply an array of strings, each of which is the Solidity function or event 
signature.

.. code-block:: javascript
    :caption: *Human-Readable ABI*

    let ABI = [
        "event Transfer(address from, address to, uint amount)",
        "function transfer(address to, uint amount)",
        "function symbol() view returns (string)"
    ]


-----

.. _Human-Readable ABI: https://blog.ricmoo.com/human-readable-contract-abis-in-ethers-js-141902f4d917
.. _Event Emitter API: https://nodejs.org/api/events.html#events_class_eventemitter

.. EOF
