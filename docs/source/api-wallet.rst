Wallets
*******

A *Wallet* manages a private/public key pair which is used to cryptographically sign
transactions and prove ownership on the Ethereum network.

::

    var Wallet = require('ethers').Wallet;


-----

Creating Instances
==================

new :sup:`ethers` . Wallet( privateKey [ , provider ] )
    Creates a new instance from *privateKey* and optionally connect a provider

:sup:`Wallet` . createRandom ( [ options ] )
    Creates a new random wallet; *options* may specify ``extraEntropy`` to stir into
    the random source (make sure this wallet is stored somewhere safe; if lost there
    is no way to recover it)

:sup:`Wallet` . fromEncryptedWallet ( json, password [ , progressCallback ] )
    Decrypt an encrypted Secret Storage JSON Wallet (from Geth, or that was
    created using ``prototype.encrypt()``)

:sup:`Wallet` . fromMnemonic ( mnemonic [ , path ] )
    Generate a BIP39 + BIP32 wallet from a *mnemonic* deriving path
    (default: ``m/44'/60'/0'/0/0``)

:sup:`Wallet` . fromBrainWallet ( username, password [ , progressCallback ] )
    fobo

-----

Instances
=========


.. _address:

:sup:`prototype` . address
    The public address of a wallet

:sup:`prototype` . privateKey
    The private key of a wallet; keep this secret

:sup:`prototype` . provider
    Optional; a connected :ref:`provider` which allows the wallet to connect to
    the Ethereum network to query its state and send transactions

:sup:`prototype` . getAddress ( )
    A function which returns the address; for Wallet, this simple returns the
    `address`_ property

:sup:`prototype` . sign ( transaction )
    Signs a transaction and returns the signed transaction as a raw hex string.

:sup:`prototype` . encrypt ( password [ , options ] [ , progressCallback ] )
    Returns a Promise with the wallet encrypted as a Secret Storage JSON Wallet;
    *options* may include overrides for the scypt parameters

Examples
--------

::

    var Wallet = require('ethers').Wallet;

    var privateKey = '0x012...';
    var wallet = new Wallet(privateKey);

    console.log('My Address: ' + wallet.address);
    // 0x123456...

    wallet.provider = new ethers.providers.EtherscanProvider({testnet: true});
    wallet.getBalance().then(function(balance) {

        // The balance is in wei (there are 1e18 wei per ether), so we use
        // this convenience method to format it into ether
        console.log('Balance: ' + ethers.formatEther(balance));
    });

    var signedTransaction = wallet.sign({
        to: 0x...,
    });
    console.log(signedTransaction);


-----

Blockchain Operations
=====================

These operations require the wallet have a provider attached to it.

:sup:`prototype` . getBalance ( [ blockTag ] )
    Returns a Promise with the balance of the wallet (as a :ref:`BigNumber <bignumber>`,
    in **wei**) at the :ref:`blockTag <blocktag>` (default: ``"latest"``)

:sup:`prototype` . getTransactionCount ( [ blockTag ] )
    Returns a Promise with the number of transactions this account has ever sent
    (also called the *nonce*) at the :ref:`blockTag <blocktag>` (default: ``"latest"``)

:sup:`prototype` . estimateGas ( transaction )
    Returns a Promise with the estimated cost for *transaction* (in **gas**, as a
    :ref:`BigNumber <bignumber>`)

:sup:`prototype` . sendTransaction ( transaction )
    Sends the *transaction* to the network and returns a Promise with the transaction
    details.

:sup:`prototype` . send ( address, amountWei [ , options ] )
    Sends *amountWei* to *address* on the network and returns a Promise with the
    transaction details.

Examples
--------

::

    var balancePromise = wallet.getBalance();

    balancePromise.then(function(balance) {
        console.log(balance);
    });

    var transactionCountPromise = wallet.getTransactionCount();

    transactionCountPromise.then(function(transactionCount) {
        console.log(transactionCount);
    });

    var estimateGasPromise = wallet.estimateGas(transaction);

    estimateGasPromise.then(function(gasEstimate) {
        console.log(gasEstimate);
    });


    var sendTransactionPromise = wallet.sendTransaction(transaction);

    sendTransactionPromise.then(function(transactionHash) {
        console.log(transactionHash);
    });

    var address = '0x12..'

    // We must pass in the amount as wei (1 ether = 1e18 wei), so we use
    // this convenience function to convert ether to wei.
    var amount = ethers.parseEther('1.0');

    var sendPromise = wallet.send(address, amount);

    sendPromise.then(function(transactionHash) {
        console.log(transactionHash);
    });


    // Overriding Network Default Values::

    var options = {
        gasLimit: 
        gasPrice:
    };
    var promiseSend = wallet.send(address, amount, options);


-----

Encryption and Decryption
=========================

:sup:`prototype` . encryptWallet ( password [ , progressCallback ] )
    foobar

Examples
--------

::

    var json = "{...}"

    var password = "foobar";

    function callback(percent) {
        console.log("Decrypting: " + parseInt(percent * 100) + "% complete");
    }

    var decryptPromise = Wallet.decryptWallet(json, password, callback);

    decryptPromise.then(function(wallet) {
        console.log(wallet);
    });



    var username = "ricmoo";

    var password = "foobar";

    function callback(percent) {
        console.log("Decrypting: " + parseInt(percent * 100) + "% complete");
    }

    var summonBrainPromise = Wallet.summonBrainWallet(username, password, callback);

    summonBrainPromise.then(function(wallet) {
        console.log(wallet);
    });



    var json = ...

    var isCrowdsaleWallet = Wallet.isCrowdsaleWallet(json);

    console.log(isCrowdsaleWallet);



    var json = ...

    var password = "foobar";

    var wallet = Wallet.decryptCrowdsale(json, password);



    var password = "foobar";

    function callback(percent) {
        console.log("Encrypting: " + parseInt(percent * 100) + "% complete");
    }

    var encryptPromise = wallet.encrypt(password, callback);

    encryptPromise.then(function(json) {
        console.log(json);
    });

Wallet.decryptCrowdsale( json, password )
Wallet.isCrowdsaleWallet( json )

-----

Transactions
============

:sup:`Wallet` . parseTransaction( arrayishOrHexString )
    Parses a raw transaction

Example::

    var transaction = {
        to: 0123...
        value: 0123...
    };
    var signedTransaction = wallet.sign(transaction);
    var transaction = Wallet.parseTransaction(signedTransaction);

    console.log(transaction);
    /// {to: 0123, value: 0123}


Transaction Object
------------------

A transaction is any object with the following properties::

    {
        to: address,
        gasLimit: gasLimit,
        gasPrice: gasLimit,
        nonce,
        data: data,
        value: amountWei,
        chainId: chainId
    }

to:
    The address to send the transaction to. *(required)*

gasLimit:
    The maximum amount of gas to allow this transaction to consume. If this amount
    is exceeded, the transaction will fail but the gas will still be consumed.
    (default: based on network defaults)

gasPrice:
    The price (in *wei*) per unit of gas. (default: network default)

nonce:
    This value is unique per address per transaction and used to prevent replaying
    old transactions. You should not usually need to set this manually. (default:
    queried from the network, for a given address)

data:
    Any data to send with the transaction. (default: ``0x``; i.e. no data)

value:
    The amount of **wei** to send (default: 0)

chainId:
    The network ID to sign the transaction with; setting this to 0 will enable
    legacy signing and will not protect from replay attacks (default: use safe
    network default)

-----

\ 
