Accounts
********

Some quick examples of using Accounts.

-----

Dump All JSON Wallet Balances (in current directory)
====================================================

.. code-block:: javascript
    :caption: *Load JSON Wallet Balances*

    const fs = require('fs');
    const path = require('path');

    const ethers = require('ethers');

    let provider = ethers.getDefaultProvider();

    // Geth
    let dirname = path.join(process.env.HOME, '.ethereum', 'keystore');

    // Parity (use the name of your chain for chainDirectory, such as "homestead")
    //var dirname = path.join(process.env.HOME, '.parity', 'keys', chainDirectory, 'keys');

    let filenames = fs.readdirSync(dirname);

    filenames.forEach(async function(filename) {

        // Get the Wallet JSON
        let data = await fs.readFile(path.join(dirname,filename));

        // Get the Wallet address
        let address = ethers.utils.getJsonWalletAddress(data.toString());

        // Look up the balance
        let balance = await provider.getBalance(address);

        console.log(address + ':' + ethers.utils.formatEther(balance));
    });


-----

Sweep an Account into Another
=============================

This will sweep **all** the funds from one account's *privateKey* and
place it in another account, *newAddress*.

.. code-block:: javascript
    :caption: *Sweep an Account*

    const ethers = require('ethers');

    async function sweep(privateKey, newAddress) {

        let provider = ethers.getDefaultProvider();

        let wallet = new ethers.Wallet(privateKey, provider);

        // Make sure we are sweeping to an EOA, not a contract. The gas required
        // to send to a contract cannot be certain, so we may leave dust behind
        // or not set a high enough gas limit, in which case the transaction will
        // fail.
        let code = await provider.getCode(newAddress);
        if (code !== '0x') { throw new Error('Cannot sweep to a contract'); }

        // Get the current balance
        let balance = await wallet.getBalance();

        // Normally we would let the Wallet populate this for us, but we
        // need to compute EXACTLY how much value to send
        let gasPrice = await provider.getGasPrice();

        // The exact cost (in gas) to send to an Externally Owned Account (EOA)
        let gasLimit = 21000;

        // The balance less exactly the txfee in wei
        let value = balance.sub(gasPrice.mul(gasLimit))

        let tx = await wallet.sendTransaction({
            gasLimit: gasLimit,
            gasPrice: gasPrice,
            to: newAddress,
            value: value
        });

        console.log('Sent in Transaction: ' + tx.hash);
    });

-----

Coalesce Jaxx Wallets
=====================

The Jaxx Wallet (for iOS, Android, desktop, et cetera) uses HD wallets on Ethereum the
same way as Bitcoin, which results in each transaction being received by a separate
address. As a result, funds get spread across many accounts, making several operations
in Ethereum impossible.

This short recipe will coalesce all these accounts into a single one, by sending the funds
from each account into a single one.

This also results in paying multiple transaction fees (1 fee per account to merge).

@TODO: This is incomplete!!

.. code-block:: javascript
    :caption: *TODO*

    const ethers = require('ethers');

    let provider = ethers.getDefaultProvider();

    let mnemonic = "radar blur cabbage chef fix engine embark joy scheme fiction master release";
    let hdnode = ethers.utils.HDNode.fromMnemonic(mnemonic);
    let hdnode = hdnode.derivePath("m/44'/60'/0'/0");

     // @TODO

-----

Access Funds in a Mnemonic Phrase Wallet
========================================

@TODO: This is incomplete

.. code-block:: javascript
    :caption: *TODO*

    const ethers = require('ethers');

    let walletPath = {
        "standard": "m/44'/60'/0'/0/0",

        // @TODO: Include some non-standard wallet paths
    };

    let mnemonic = "radar blur cabbage chef fix engine embark joy scheme fiction master release";
    let hdnode = ethers.HDNode.fromMnemonic(mnemonic);
    let node = hdnode.derivePath(walletPath.standard);

    let wallet = new ethers.Wallet(node.privateKey);
    console.log(wallet.address);
    // 0xaC39b311DCEb2A4b2f5d8461c1cdaF756F4F7Ae9

    // @TODO:

-----

Random Mnemonic
===============

Often you may simply want a random mnemonic that is valid. It is important to
note that **not** all random sets of words are valid; there is a checksum
included in the binary encoding of the entropy, so it is important to use
a method that correctly encodes this checksum.

.. code-block:: javascript
    :caption: *Random Mnemonic*

    const ethers = require('ethers');

    // All createRandom Wallets are generated from random mnemonics
    let wallet = ethers.Wallet.createRandom();
    let randomMnemonic = wallet.mnemonic;

.. code-block:: javascript
    :caption: *More Complex Random Mnemonic*

    const utils = require('ethers/utils');

    // Chose the length of your mnemonic:
    //   - 16 bytes => 12 words (* this example)
    //   - 20 bytes => 15 words
    //   - 24 bytes => 18 words
    //   - 28 bytes => 21 words
    //   - 32 bytes => 24 words
    let bytes = ethers.utils.random(16);

    // Select the language:
    //   - en, es, fr, ja, ko, it, zh_ch, zh_tw
    let language = ethers.wordlists.en;

    let randomMnemonic = ethers.utils.HDNode.entropyToMnemonic(bytes, language)

-----

Get Transaction History
=======================

Unfortunately, transaction history is not something that is easy to get. It
is not indexed by the blockchain, not by a standard node, "out-of-the-box".
At the time of this recipe, the indices to store the entire history are
around 800GB. For Parity you may enable tracing and disable pruning, in
which case you can use some of the vendor specific JSON-RPC debug methods.

For many cases, you can probably rely on Etherscan, which dedicates large
amounts of resources to tracking and storing this information.

.. code-block:: javascript
    :caption: *Transaction History*

    let etherscanProvider = new ethers.providers.EtherscanProvider();

    etherscanProvider.getHistory(address).then((history) => {
        history.forEach((tx) => {
            console.log(tx);
        })
    });

-----

@TODO: Example of signing and verifying a hash in ethers and in Solidity.

-----


.. EOF
