Cookbook
********

This is a small (but growing) collection of simple recipes to perform common tasks
with the Ethereum blockchain and Ethereum accounts.

Some of these recipes are stubs that will be filled in shortly.

If there is a simple recipe you would like added, please send suggestions to support@ethers.io.

-----

Dump All JSON Wallet Balances (in current directory)
====================================================

::

    var fs = require('fs');
    var path = require('path');

    var ethers = require('ethers');
    var provider = ethers.providers.getDefaultProvider();

    // Geth
    var dirname = path.join(process.env.HOME, '.ethereum', 'keystore');

    // Parity (use the name of your chain for chainDirectory, such as "homestead")
    //var dirname = path.join(process.env.HOME, '.parity', 'keys', chainDirectory, 'keys');

    var filenames = fs.readdirSync(dirname);

    filenames.forEach(function(filename) {
        fs.readFile(path.join(dirname,filename), function(error, data) {
            if (error) {
                console.log('Error reading file: ' + error.message);
                return;
            }

            var address = JSON.parse(data.toString()).address;
            provider.getBalance(address).then(function(balance) {
                console.log(address + ':' + ethers.utils.formatEther(balance));
            });
        });
    });


-----

Empty One Account into Another
==============================

::

    var ethers = require('ethers');

    var provider = ethers.providers.getDefaultProvider();

    var newAddress = '';
    var privateKey = '';

    var wallet = new ethers.Wallet(privateKey, provider);
    Promise.all([
        wallet.getBalance(),
        provider.getGasPrice(),
        provider.getCode(newAddress)
    ]).then(function(results) {
        var balance = results[0];
        var gasPrice = results[1];
        var code = results[2];

        if (code !== '0x') {
            throw new Error('this tool should not send to a contract');
        }

        // The exact cost (in gas) to send to an Externally Owned Account (EOA)
        var gasLimit = 21000;

        // The balance less exactly the txfee in wei
        var value = balance.sub(gasPrice.mul(gasLimit))

        wallet.send(newAddress, value, {gasLimit: gasLimit}).then(function(transaction) {
            console.log(transaction);
        });
    });

-----

Transactions Confirm UI (with a Custom Signer)
==============================================

::

    function CustomSigner(privateKey) {

        this.provider = ethers.getDefaultProvider();

        var wallet = new ethers.Wallet(privateKey);

        this.address = wallet.address;

        this.sign = function(transaction) {
            return new Promise(function(resolve, reject) {
                var allow = confirm('Sign Transaction? To: ' + transaction.to +
                    ", Amount: " + ethers.formatEther(transaction.value));

                var etherString = ethers.formatEther(transaction.value);

                var modal = document.createElement('pre');
                document.body.appendChild(modal);
                modal.className = "modal";
                modal.textContent += 'Sign Transaction?\n';
                modal.textContent += 'To:     ' + transaction.address + '\n';
                modal.textContent += 'Amount: ' +  etherString + '\n';

                var confirmButton = document.createElement('div');
                modal.appendChild(confirmButton);
                confirmButton.textContent = ""confirm";
                confirmButton.onclick = function() {
                    resolve(wallet.sign(transaction));
                }

                var rejectButton = document.createElement('div');
                modal.appendChild(rejectButton);
                rejectButton.textContent = ""confirm";
                rejectButton.onclick = function() {
                    modal.remove();
                    reject(new Error('cancelled transaction'));
                }
        }
    }

-----

Break Apart r, s and v from a Message Signature
================================================

::

    var ethers = require('ethers');

    var privateKey = '0x0123456789012345678901234567890123456789012345678901234567890123';
    var message = "Hello World";
    var wallet = new ethers.Wallet(privateKey);
    var signature = wallet.signMessage(message);

    // Split apart the signature into an r, s and v that can be used by
    // ecrecover in Solidity. The v parameter will be normalized to the
    // canonical value of 27 or 28.
    var sig = ethers.utils.splitSignature(signature);

    console.log(sig);
    // {
    //   r: '0xe0ed34fbbe927a58267ce2e8067a611c69869e20e731bc99187a8bc97058664c',
    //   s: '0x16de07f7660f06ce0985d1d8e063726783033fda59b307897f26a21392d62b3a',
    //   v: 28
    // }

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

*Source Code*
-------------

::

    var ethers = require('ethers');

    var provider = ethers.providers.getDefaultProvider();

    var mnemonic = "radar blur cabbage chef fix engine embark joy scheme fiction master release";
    var hdnode = ethers.HDNode.fromMnemonic(mnemonic);
    hdnode = hdnode.derivePath("m/44'/60'/0'/0");

    @TODO:


-----

Access Funds in a Mnemonic Phrase Wallet
========================================

@TODO: This is incomplete

*Source Code*
-------------

::

    var ethers = require('ethers');

    var walletPath = {
        "standard": "m/44'/60'/0'/0/0",

        // @TODO: Include some non-standard wallet paths
    };

    var mnemonic = "radar blur cabbage chef fix engine embark joy scheme fiction master release";
    var hdnode = ethers.HDNode.fromMnemonic(mnemonic);
    var node = hdnode.derivePath(walletPath.standard);

    var wallet = new ethers.Wallet(node.privateKey);
    console.log(wallet.address);
    // 0xaC39b311DCEb2A4b2f5d8461c1cdaF756F4F7Ae9

    @TODO:

-----

Custom Provider
===============

This is a much more advanced topic, and most people should not need to work this
low level. But it is provided for those rare instances where you need some custom
connection logic.

A provider must only implement the method **perform(method, params)**. All data passed
into a provider is sanitized by the Provider subclass, and all results are normalized
before returning them to the user.

For this example, we will build a DebugProvider, which will simple proxy all commands
through to INFURA, but dump all data going back and forth.

::

    var inherits = require('inherits');
    var ethers = require('ethers');

    function DebugProvider(testnet) {
        Provider.call(this, testnet);
        this.subprovider = new ethers.providers.InfuraProvider(testnet);
    }
    inherits(DebugProvider, ethers.providers.Provider);

    // This should return a Promise (and may throw erros)
    // method is the method name (e.g. getBalance) and params is an
    // object with normalized values passed in, depending on the method
    DebugProvier.prototype.perform = function(method, params) {
        this.subprovider.perform(method, params).then(function(result) {
            console.log('DEBUG', method, params, '=>', result);
        });
    }

-----

.. EOF
