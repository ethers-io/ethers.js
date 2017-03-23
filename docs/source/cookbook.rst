Cookbook
********

Some quick snippets of code and ideas to work from.

-----

Dump Balances of All Geth Wallets (in the current director)
===========================================================

Geth
    ~/.ethereum/keystore

Parity
    ~/.parity/keys/*some directory*/keys

*SourceCode:* ::

    var fs = require('fs');

    var ethers = require('ethers');
    var provider = ethers.providers.defaultProvider();

    var filenames = fs.readDirSync('.');

    filenames.forEach(function(filename) {
        fs.readFile(filename, function(error, data) {
            if (error) {
                console.log('Error reading file: ' + error.message);
                return;
            }

            var address = Wallet.getWalletAddress(data.toString());
            provider.getBalance(address).then(function(balance) {
                console.log(address + ':' + ethers.formatEther(balance));
            });
        });
    });


-----

Empty One Account into Another
==============================

Include example links to etherscan showing the transactions

*Source Code:* ::

    var ethers = require('ethers');

    var provider = ethers.providers.getDefaultProvider();

    var newAddress = '';
    var privateKey = '';

    var wallet = new ethers.Wallet(privateKey, provider);
    Promise.all([
        wallet.getBalance(),
        provider.getGasPrice(),
    ]).then(function(results) {
        var balance = results[0];
        var gasPrice = results[1];

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


*Source Code:* ::

    var ethers = require('ethers');

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

Coalesce Jaxx Wallets
=====================

Explain how Jaxx uses HD Wallets

*Source Code:* ::

    var ethers = require('ethers');

    var provider = ethers.providers.getDefaultProvider();

    var hdnode = ethers.HDNode.fromMnemonic();
    hdnode = hdnode.derivePath("m/44'/60'/0'/0");


-----

Access Funds in a Mnemonic Phrase Wallet
========================================

*Source Code:* ::

    var ethers = require('ethers');

    var walletPath = {
        "standard": "m/44'/60'/0'/0/0",

        "electrum": "m/0'"  // Non-standard
    };

    var mnemonic = "";

    var hdnode = ethers.HDNode.fromMnemonic(mnemonic);
    var node = hdnode.derivePath(walletPath.standard);

    var wallet = new Wallet(node.privateKey);
    console.log(wallet.address);

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

*Source Code:* ::

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

\ 
