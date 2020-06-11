.. |nbsp| unicode:: U+00A0 .. non-breaking space

.. _api-wallet:

Wallets and Signers
*******************

A **Wallet** manages a private/public key pair which is used to cryptographically sign
transactions and prove ownership on the Ethereum network.

-----

.. _wallet:

Wallet
======

The **Wallet** implements the :ref:`Signer API <signer>` and can be used anywhere a *Signer*
is expected and has all the required properties.

|

Creating Instances
------------------

new :sup:`Wallet` ( privateKey [ , provider ] )
    Creates a new instance from *privateKey* and optionally connect a provider

:sup:`Wallet` . createRandom ( [ options ] ) |nbsp| :sup:`=>` |nbsp| :sup:`Wallet`
    Creates a new random wallet. Ensure this wallet is stored somewhere safe, if
    lost there is **NO way to recover it**.

    Options may have the properties:

        - **extraEntropy** --- additional entropy to stir into the random source

.. _fromEncryptedJson:

:sup:`Wallet` . fromEncryptedJson ( json, password [ , progressCallback ] ) |nbsp| :sup:`=>` |nbsp| :sup:`Wallet`
    Decrypt an encrypted Secret Storage `JSON Wallet`_ (from Geth, parity, Crowdsale
    tools, or that was created using *prototype.encrypt* )

:sup:`Wallet` . fromMnemonic ( mnemonic [ , path :sup:`= "m/44'/60'/0'/0/0"` [ , wordlist ] ] ) |nbsp| :sup:`=>` |nbsp| :sup:`Wallet`
    Generate a `BIP-039`_ + `BIP-044`_ wallet from *mnemonic* deriving *path* using
    the *wordlist*. The default language is English (en).

    In the browserified ``dist/ethers.min.js`` only the English wordlist is
    available. Each additional wordlist may be included by adding a ``<script>``
    for the ``dist/wordlist-*.js``

    The current supported wordlists are:

    ===================== =========================== =======================
    Language              node.js                     Browser
    ===================== =========================== =======================
    English (US)          ``ethers.wordlists.en``     *included*
    Italian               ``ethers.wordlists.it``     ``dist/wordlist-it.js``
    Japanese              ``ethers.wordlists.ja``     ``dist/wordlist-ja.js``
    Korean                ``ethers.wordlists.ko``     ``dist/wordlist-ko.js``
    Chinese (simplified)  ``ethers.wordlists.zh_cn``  ``dist/wordlist-zh.js``
    Chinese (traditional) ``ethers.wordlists.zh_tw``  ``dist/wordlist-zh.js``
    ===================== =========================== =======================

.. _wallet-connect:

:sup:`prototype` . connect ( provider ) |nbsp| :sup:`=>` |nbsp| :sup:`Wallet`
    Creates a new Wallet instance from an existing instance, connected to a new *provider*.

|

|

.. code-block:: javascript
    :caption: *load a private key*

    let privateKey = "0x0123456789012345678901234567890123456789012345678901234567890123";
    let wallet = new ethers.Wallet(privateKey);

    // Connect a wallet to mainnet
    let provider = ethers.getDefaultProvider();
    let walletWithProvider = new ethers.Wallet(privateKey, provider);

.. code-block:: javascript
    :caption: *create a new random account*

    let randomWallet = ethers.Wallet.createRandom();


.. code-block:: javascript
    :caption: *load a JSON wallet*

    let data = {
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

    let json = JSON.stringify(data);
    let password = "foo";

    ethers.Wallet.fromEncryptedJson(json, password).then(function(wallet) {
        console.log("Address: " + wallet.address);
        // "Address: 0x88a5C2d9919e46F883EB62F7b8Dd9d0CC45bc290"
    });


.. code-block:: javascript
    :caption: *load a mnemonic phrase*

    let mnemonic = "radar blur cabbage chef fix engine embark joy scheme fiction master release";
    let mnemonicWallet = ethers.Wallet.fromMnemonic(mnemonic);

    // Load the second account from a mnemonic
    let path = "m/44'/60'/1'/0/0";
    let secondMnemonicWallet = ethers.Wallet.fromMnemonic(mnemonic, path);

    // Load using a non-english locale wordlist (the path "null" will use the default)
    let secondMnemonicWallet = ethers.Wallet.fromMnemonic(mnemonic, null, ethers.wordlists.ko);

-----

Prototype
---------

:sup:`prototype` . address
    The public address of a wallet

:sup:`prototype` . privateKey
    The private key of a wallet; keep this secret

:sup:`prototype` . provider
    A connected :ref:`Provider <provider>` which allows the wallet to
    connect to the Ethereum network to query its state and send transactions,
    or null if no provider is connected.

    To change the provider, use the :ref:`connect <wallet-connect>` method, which will return
    a **new instance** of the Wallet connected to the provider.

    

:sup:`prototype` . mnemonic
    The mnemonic phrase for this wallet, or null if the mnemonic is unknown.

:sup:`prototype` . path
    The mnemonic path for this wallet, or null if the mnemonic is unknown.

-----

Signing
-------

:sup:`prototype` . sign ( transaction ) |nbsp| :sup:`=>` |nbsp| :sup:`Promise<string>`
    Signs *transaction* and returns a :ref:`Promise <promise>` that resolves to
    the signed transaction as a :ref:`hex string <hexstring>`.

    In general, the `sendTransaction`_ method is preferred to ``sign``, as it can automatically
    populate values asynchronously.

    The properties for transaction are all optional and include:

        - **to**
        - **gasLimit**
        - **gasPrice**
        - **nonce**
        - **data**
        - **value**
        - **chainId**

:sup:`prototype` . signMessage ( message ) |nbsp| :sup:`=>` |nbsp| :sup:`Promise<string>`
    Signs *message* and returns a :ref:`Promise <promise>` that resolves to
    the :ref:`flat-format <signature>` signature.

    If *message* is a string, it is converted to UTF-8 bytes, otherwise it is
    preserved as a binary representation of the :ref:`Arrayish <arrayish>` data.

.. code-block:: javascript
    :caption: *signing transactions*

    let privateKey = "0x3141592653589793238462643383279502884197169399375105820974944592"
    let wallet = new ethers.Wallet(privateKey)

    console.log(wallet.address)
    // "0x7357589f8e367c2C31F51242fB77B350A11830F3"

    // All properties are optional
    let transaction = {
        nonce: 0,
        gasLimit: 21000,
        gasPrice: utils.bigNumberify("20000000000"),

        to: "0x88a5C2d9919e46F883EB62F7b8Dd9d0CC45bc290",
        // ... or supports ENS names
        // to: "ricmoo.firefly.eth",

        value: utils.parseEther("1.0"),
        data: "0x",

        // This ensures the transaction cannot be replayed on different networks
        chainId: ethers.utils.getNetwork('homestead').chainId
    }

    let signPromise = wallet.sign(transaction)

    signPromise.then((signedTransaction) => {

        console.log(signedTransaction);
        // "0xf86c808504a817c8008252089488a5c2d9919e46f883eb62f7b8dd9d0cc45bc2
        //    90880de0b6b3a76400008025a05e766fa4bbb395108dc250ec66c2f88355d240
        //    acdc47ab5dfaad46bcf63f2a34a05b2cb6290fd8ff801d07f6767df63c1c3da7
        //    a7b83b53cd6cea3d3075ef9597d5"

        // This can now be sent to the Ethereum network
        let provider = ethers.getDefaultProvider()
        provider.sendTransaction(signedTransaction).then((tx) => {

            console.log(tx);
            // {
            //    // These will match the above values (excluded properties are zero)
            //    "nonce", "gasLimit", "gasPrice", "to", "value", "data", "chainId"
            //
            //    // These will now be present
            //    "from", "hash", "r", "s", "v"
            //  }
            // Hash:
        });
    })


.. code-block:: javascript
    :caption: *signing text messages*

    let privateKey = "0x3141592653589793238462643383279502884197169399375105820974944592"
    let wallet = new ethers.Wallet(privateKey);

    // Sign a text message
    let signPromise = wallet.signMessage("Hello World!")

    signPromise.then((signature) => {

        // Flat-format
        console.log(signature);
        // "0xea09d6e94e52b48489bd66754c9c02a772f029d4a2f136bba9917ab3042a0474
        //    301198d8c2afb71351753436b7e5a420745fed77b6c3089bbcca64113575ec3c
        //    1c"

        // Expanded-format
        console.log(ethers.utils.splitSignature(signature));
        // {
        //   r: "0xea09d6e94e52b48489bd66754c9c02a772f029d4a2f136bba9917ab3042a0474",
        //   s: "0x301198d8c2afb71351753436b7e5a420745fed77b6c3089bbcca64113575ec3c",
        //   v: 28,
        //   recoveryParam: 1
        //  }
    });

.. code-block:: javascript
    :caption: *signing binary messages*

    let privateKey = "0x3141592653589793238462643383279502884197169399375105820974944592"
    let wallet = new ethers.Wallet(privateKey);

    // The 66 character hex string MUST be converted to a 32-byte array first!
    let hash = "0x3ea2f1d0abf3fc66cf29eebb70cbd4e7fe762ef8a09bcc06c8edf641230afec0";
    let binaryData = ethers.utils.arrayify(hash);

    let signPromise = wallet.signMessage(binaryData)

    signPromise.then((signature) => {

        console.log(signature);
        // "0x5e9b7a7bd77ac21372939d386342ae58081a33bf53479152c87c1e787c27d06b
        //    118d3eccff0ace49891e192049e16b5210047068384772ba1fdb33bbcba58039
        //    1c"
    });

-----

Blockchain Operations
---------------------

These operations require the wallet have a provider attached to it.

:sup:`prototype` . getBalance ( [ blockTag :sup:`= "latest"` ] ) |nbsp| :sup:`=>` |nbsp| :sup:`Promise<BigNumber>`
    Returns a :ref:`Promise <promise>` that resolves to the balance of the wallet
    (as a :ref:`BigNumber <bignumber>`, in **wei**) at the :ref:`blockTag <blocktag>`.

:sup:`prototype` . getTransactionCount ( [ blockTag :sup:`= "latest"` ] ) |nbsp| :sup:`=>` |nbsp| :sup:`Promise<number>`
    Returns a :ref:`Promise <promise>` that resovles to the number of transactions
    this account has ever sent (also called the *nonce*) at the :ref:`blockTag <blocktag>`.

:sup:`prototype` . estimateGas ( transaction ) |nbsp| :sup:`=>` |nbsp| :sup:`Promise<BigNumber>`
    Returns a :ref:`Promise <promise>` with the estimated cost for *transaction* (as a
    :ref:`BigNumber <bignumber>`, in **gas**)

.. _sendTransaction:

:sup:`prototype` . sendTransaction ( transaction ) |nbsp| :sup:`=>` |nbsp| :sup:`Promise<TransactionResponse>`
    Sends the *transaction* (see :ref:`Transaction Requests <transaction-request>`) to
    the network and returns a :ref:`Promise <promise>` that resolves to a
    :ref:`Transaction Response <transaction-response>`. Any properties that are not
    provided will be populated from the network.

.. code-block:: javascript
    :caption: *query the network*

    // We require a provider to query the network
    let provider = ethers.getDefaultProvider();

    let privateKey = "0x3141592653589793238462643383279502884197169399375105820974944592"
    let wallet = new ethers.Wallet(privateKey, provider);

    let balancePromise = wallet.getBalance();

    balancePromise.then((balance) => {
        console.log(balance);
    });

    let transactionCountPromise = wallet.getTransactionCount();

    transactionCountPromise.then((transactionCount) => {
        console.log(transactionCount);
    });


.. code-block:: javascript
    :caption: *transfer ether*

    // We require a provider to send transactions
    let provider = ethers.getDefaultProvider();

    let privateKey = "0x3141592653589793238462643383279502884197169399375105820974944592"
    let wallet = new ethers.Wallet(privateKey, provider);

    let amount = ethers.utils.parseEther('1.0');

    let tx = {
        to: "0x88a5c2d9919e46f883eb62f7b8dd9d0cc45bc290",
        // ... or supports ENS names
        // to: "ricmoo.firefly.eth",

        // We must pass in the amount as wei (1 ether = 1e18 wei), so we
        // use this convenience function to convert ether to wei.
        value: ethers.utils.parseEther('1.0')
    };

    let sendPromise = wallet.sendTransaction(tx);

    sendPromise.then((tx) => {
        console.log(tx);
        // {
        //    // All transaction fields will be present
        //    "nonce", "gasLimit", "pasPrice", "to", "value", "data",
        //    "from", "hash", "r", "s", "v"
        // }
    });


-----

Encrypted JSON Wallets
----------------------

Many systems store private keys as encrypted JSON wallets, in various formats. There are several
formats and algorithms that are used, all of which are supported to be read.
Only the secure scrypt variation can be generated.

See :ref:`Wallet.fromEncryptedJson <fromEncryptedJson>` for creating a
Wallet instance from a JSON wallet.

:sup:`prototype` . encrypt ( password [ , options [ , progressCallback ] ] ) |nbsp| :sup:`=>` |nbsp| :sup:`Promise<string>`
    Encrypts the wallet as an encrypted JSON wallet, with the *password*.

    All options are optional. The valid options are:

        - **salt** --- the salt to use for scrypt
        - **iv** --- the initialization vecotr to use for aes-ctr-128
        - **uuid** --- the UUID to use for the wallet
        - **scrypt** --- the scrypt parameters to use (N, r and p)
        - **entropy** --- the mnemonic entropy of this wallet; generally you should **not** specify this
        - **mnemonic** --- the mnemonic phrase of this wallet; generally you should **not** specify this
        - **path** --- the mnemonic path of this wallet; generally you should **not** specify this

    If the *progressCallback* is specified, it will be called periodically during
    encryption with a value between 0 and 1, inclusive indicating the progress.


.. code-block:: javascript
    :caption: *encrypt a wallet as an encrypted JSON wallet*

    let password = "password123";

    function callback(progress) {
        console.log("Encrypting: " + parseInt(progress * 100) + "% complete");
    }

    let encryptPromise = wallet.encrypt(password, callback);

    encryptPromise.then(function(json) {
        console.log(json);
    });

-----

.. _signer:

Signer API
==========

The Signer API is an abstract class which makes it easy to extend and add new signers,
that can be used by this library and extension libraries. The :ref:`Wallet <wallet>`
extends the Signer API, as do the :ref:`JsonRpcSigner <signer-jsonrpc>` and the
`Ledger Hardware Wallet Signer`_.

To implement a Signer, inherit the abstract class *ethers.types.Signer* and implement
the following properties:

:sup:`object` . provider
    A :ref:`Provider <api-provider>` that is connected to the network. This is optional, however,
    without a *provider*, **only** *write-only* operations should be expected to work.

:sup:`object` . getAddress ( ) |nbsp| :sup:`=>` |nbsp| :sup:`Promise<Address>`
    Returns a :ref:`Promise <promise>` that resolves to the account address.

:sup:`object` . signMessage ( message ) |nbsp| :sup:`=>` |nbsp| :sup:`Promise<hex>`
    Returns a :ref:`Promise <promise>` that resolves to the :ref:`Flat-Format Signature <signature>`
    for the *message*.

    If *message* is a string, it is converted to UTF-8 bytes, otherwise it is
    preserved as a binary representation of the :ref:`Arrayish <arrayish>` data.

:sup:`object` . sendTransaction ( transaction ) |nbsp| :sup:`=>` |nbsp| :sup:`Promise<TransactionResponse>`
    Sends the *transaction* (see :ref:`Transaction Requests <transaction-request>`) to
    the network and returns a :ref:`Promise <promise>` that resolves to a
    :ref:`Transaction Response <transaction-response>`. Any properties that are not
    provided will be populated from the network.

-----

.. _BIP-039: https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
.. _BIP-044: https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki
.. _Ledger Hardware Wallet Signer: https://github.com/ethers-io/ethers-ledger
.. _JSON Wallet: https://medium.com/@julien.maffre/what-is-an-ethereum-keystore-file-86c8c5917b97
.. EOF
