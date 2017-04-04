.. _api-wallet:

Wallets
*******

A **wallet** manages a private/public key pair which is used to cryptographically sign
transactions and prove ownership on the Ethereum network.

::

    var Wallet = ethers.Wallet;


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
    created using *prototype.encrypt* )

:sup:`Wallet` . fromMnemonic ( mnemonic [ , path ] )
    Generate a BIP39 + BIP32 wallet from a *mnemonic* deriving path

    **default:** *path*\ ="m/44'/60'/0'/0/0"

:sup:`Wallet` . fromBrainWallet ( username, password [ , progressCallback ] )
    Generate a wallet from a username and password

*Examples*
----------

**Private Key** ::

    var privateKey = "0x0123456789012345678901234567890123456789012345678901234567890123";
    var wallet = new Wallet(privateKey);

    console.log("Address: " + wallet.address);
    // "Address: 0x14791697260E4c9A71f18484C9f997B308e59325"

**Random Wallet** ::

    var wallet = Wallet.createRandom();
    console.log("Address: " + wallet.address);
    // "Address: ... this will be different every time ..."


**Secret Storage Wallet** (e.g. Geth) ::

    var data = {
        id: "fb1280c0-d646-4e40-9550-7026b1be504a",
        address: "88a5c2d9919e46f883eb62f7b8dd9d0cc45bc290",
        Crypto: {
            kdfparams: {
                dklen: 32,
                p: 1,
                salt: "bbfa53547e3e3bfcc9786a2cbef8504a5031d82734ecef02153e29daeed658fd",
                r: 8,
                n: 262144
            },
            kdf: "scrypt",
            ciphertext: "10adcc8bcaf49474c6710460e0dc974331f71ee4c7baa7314b4a23d25fd6c406",
            mac: "1cf53b5ae8d75f8c037b453e7c3c61b010225d916768a6b145adf5cf9cb3a703",
            cipher: "aes-128-ctr",
            cipherparams: {
                iv: "1dcdf13e49cea706994ed38804f6d171"
             }
        },
        "version" : 3
    };

    var json = JSON.stringify(data);
    var password = "foo";
    Wallet.fromEncryptedWallet(json, password).then(function(wallet) {
        console.log("Address: " + wallet.address);
        // "Address: 0x88a5C2d9919e46F883EB62F7b8Dd9d0CC45bc290"
    });


**Mnemonic Phrase** ::

    var mnemonic = "radar blur cabbage chef fix engine embark joy scheme fiction master release";
    var wallet = Wallet.fromMnemonic(mnemonic);

    console.log("Address: " + wallet.address);
    // "Address: 0xaC39b311DCEb2A4b2f5d8461c1cdaF756F4F7Ae9"


**Brain Wallet** ::

    var username = "support@ethers.io";
    var password = "password123";
    Wallet.fromBrainWallet(username, password).then(function(wallet) {
        console.log("Address: " + wallet.address);
        // "Address: 0x7Ee9AE2a2eAF3F0df8D323d555479be562ac4905"
    });

-----

Prototype
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
    Signs *transaction* and returns the signed transaction as a :ref:`hex string <hexstring>`.
    See :ref:`Transaction Requests <transactionrequest>`.

:sup:`prototype` . encrypt ( password [ , options ] [ , progressCallback ] )
    Returns a Promise with the wallet encrypted as a Secret Storage JSON Wallet;
    *options* may include overrides for the scypt parameters.

*Examples*
----------

**Signing Transactions** ::

    var privateKey = "0x0123456789012345678901234567890123456789012345678901234567890123";
    var wallet = new Wallet(privateKey);

    console.log('Address: ' + wallet.address);
    // "Address: 0x14791697260E4c9A71f18484C9f997B308e59325".

    var transaction = {
        nonce: 0,
        gasLimit: 21000,
        gasPrice: utils.bigNumberify("20000000000"),

        to: "0x88a5C2d9919e46F883EB62F7b8Dd9d0CC45bc290",

        value: utils.parseEther("1.0"),
        data: "0x",

        // This ensures the transaction cannot be replayed on different networks
        chainId: providers.Provider.chainId.homestead
    };

    var signedTransaction = wallet.sign(transaction);

    console.log(signedTransaction);
    // "0xf86c808504a817c8008252089488a5c2d9919e46f883eb62f7b8dd9d0cc45bc2" +
    //   "90880de0b6b3a7640000801ca0d7b10eee694f7fd9acaa0baf51e91da5c3d324" +
    //   "f67ad827fbe4410a32967cbc32a06ffb0b4ac0855f146ff82bef010f6f2729b4" +
    //   "24c57b3be967e2074220fca13e79"

    // This can now be sent to the Ethereum network
    provider.sendTransaction(signedTransaction).then(function(hash) {
        console.log('Hash: ' + hash);
        // Hash:
    });

**Encrypting** ::

    var password = "password123";

    function callback(percent) {
        console.log("Encrypting: " + parseInt(percent * 100) + "% complete");
    }

    var encryptPromise = wallet.encrypt(password, callback);

    encryptPromise.then(function(json) {
        console.log(json);
    });


-----

Blockchain Operations
=====================

These operations require the wallet have a provider attached to it.

:sup:`prototype` . getBalance ( [ blockTag ] )
    Returns a Promise with the balance of the wallet (as a :ref:`BigNumber <bignumber>`,
    in **wei**) at the :ref:`blockTag <blocktag>`.

    **default:** *blockTag*\ ="latest"

:sup:`prototype` . getTransactionCount ( [ blockTag ] )
    Returns a Promise with the number of transactions this account has ever sent
    (also called the *nonce*) at the :ref:`blockTag <blocktag>`.

    **default:** *blockTag*\ ="latest"

:sup:`prototype` . estimateGas ( transaction )
    Returns a Promise with the estimated cost for *transaction* (in **gas**, as a
    :ref:`BigNumber <bignumber>`)

:sup:`prototype` . sendTransaction ( transaction )
    Sends the *transaction* to the network and returns a Promise with the transaction
    details. It is highly recommended to omit *transaction.chainId*, it will be
    filled in by *provider*.

:sup:`prototype` . send ( address, amountWei [ , options ] )
    Sends *amountWei* to *address* on the network and returns a Promise with the
    transaction details.

*Examples*
----------

**Query the Network** ::

    var privateKey = '0x0123456789012345678901234567890123456789012345678901234567890123';
    var wallet = new ethers.Wallet(privateKey);
    wallet.provider = ethers.providers.getDefaultProvider();

    var balancePromise = wallet.getBalance(address);

    balancePromise.then(function(balance) {
        console.log(balance);
    });

    var transactionCountPromise = wallet.getTransactionCount(address);

    transactionCountPromise.then(function(transactionCount) {
        console.log(transactionCount);
    });



**Transfer Ether** ::

    var privateKey = '0x0123456789012345678901234567890123456789012345678901234567890123';
    var wallet = new ethers.Wallet(privateKey);
    wallet.provider = ethers.providers.getDefaultProvider();

    // We must pass in the amount as wei (1 ether = 1e18 wei), so we use
    // this convenience function to convert ether to wei.
    var amount = ethers.parseEther('1.0');

    var sendPromise = wallet.send(address, amount);

    sendPromise.then(function(transactionHash) {
        console.log(transactionHash);
    });


    // These will query the network for appropriate values
    var options = {
        //gasLimit: 21000
        //gasPrice: utils.bigNumberify("20000000000")
    };

    var promiseSend = wallet.send(address, amount, options);

    promiseSend.then(function(transaction) {
        console.log(transaction);
    });


**Sending (Complex) Transactions** ::

    var privateKey = '0x0123456789012345678901234567890123456789012345678901234567890123';
    var wallet = new ethers.Wallet(privateKey);
    wallet.provider = ethers.providers.getDefaultProvider();

    var transaction = {
        // Recommendation: omit nonce; the provider will query the network
        // nonce: 0,

        // Gas Limit; 21000 will send ether to another use, but to execute contracts
        // larger limits are required. The provider.estimateGas can be used for this.
        gasLimit: 1000000

        // Recommendations: omit gasPrice; the provider will query the network
        //gasPrice: utils.bigNumberify("20000000000"),

        // Required; unless deploying a contract (in which case omit)
        to: "0x88a5C2d9919e46F883EB62F7b8Dd9d0CC45bc290",

        // Optional
        data: "0x",

        // Optional
        value: ethers.utils.parseEther("1.0"),

        // Recommendation: omit chainId; the provider will populate this
        // chaindId: providers.Provider.chainId.homestead
    };

    // Estimate the gas cost for the transaction
    //var estimateGasPromise = wallet.estimateGas(transaction);

    //estimateGasPromise.then(function(gasEstimate) {
    //    console.log(gasEstimate);
    //});

    // Send the transaction
    var sendTransactionPromise = wallet.sendTransaction(transaction);

    sendTransactionPromise.then(function(transactionHash) {
        console.log(transactionHash);
    });


-----

Parsing Transactions
====================

:sup:`Wallet` . parseTransaction ( hexStringOrArrayish )
    Parses a raw *hexStringOrArrayish* into a Transaction.

*Examples*
----------

::

    // Mainnet: 
    var raw = "0xf87083154262850500cf6e0083015f9094c149be1bcdfa69a94384b46a1f913" +
                "50e5f81c1ab880de6c75de74c236c8025a05b13ef45ce3faf69d1f40f9d15b007" +
                "0cc9e2c92f"
    var transaction = {
        to: 0123...
        value: 0123...
    };
    var signedTransaction = wallet.sign(transaction);
    var transaction = Wallet.parseTransaction(signedTransaction);

    console.log(transaction);
    // {
    //     to: "0xc149Be1bcDFa69a94384b46A1F91350E5f81c1AB",
    //     from: "0xEA674fdDe714fd979de3EdF0F56AA9716B898ec8",
    //
    //     chainId: 1,
    //
    //     gasLimit: utils.bigNumberify("90000"),
    //     gasPrice: utils.bigNumberify("21488430592"),
    //
    //     nonce: 1393250
    //     data: "0x",
    //     value: utils.parseEther("1.0017071732629267"),
    //
    //     r: "0x5b13ef45ce3faf69d1f40f9d15b0070cc9e2c92f3df79ad46d5b3226d7f3d1e8",
    //     s: "0x535236e497c59e3fba93b78e124305c7c9b20db0f8531b015066725e4bb31de6",
    //     v: 37,
    // }

-----

.. EOF
