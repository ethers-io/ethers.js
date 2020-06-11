Testing
*******

Some quick examples for techniques for testing.

-----

Contract Events
===============

.. code-block:: javascript
    :caption: *Testing ERC-20 Transfer Event*

    describe('Events', async function() {
        it('triggers a Transfer event', function() {

            let contract = new Contract(contractAddress, abi, accounts[0]);

            let transferEvent = new Promise((resolve, reject) => {
                contract.on('Transfer', (from, to, amount, event) => {
                    event.removeListener();

                    resolve({
                        from: from,
                        to: to,
                        amount: amount
                    });
                });

                setTimeout(() => {
                    reject(new Error('timeout'));
                }, 60000)
            });

            let tx = await contract.transfer(accounts[1], 12345);
            
            let event = await transferEvent;

            assert.equal(event.from, account[0].address);
            assert.equal(event.to, account[1].address);
            assert.equal(event.amount.toNumber(), 12345);
        });
    });

-----

Using Multiple Accounts
=======================

.. code-block:: javascript
    :caption: *Testing Multiple Accounts*

    describe('Events', async function() {
        it('triggers a Transfer event', function() {

            // Connect to Geth/Parity node on http://localhost:8545
            let provider = new providers.JsonRpcProvider();

            // Get the first two accounts from the Geth/Parity node
            let signer0 = provider.getSigner(0);
            let signer1 = provider.getSigner(1);

            // Read-only connection to the contract
            let contract = new Contract(contractAddress, abi, provider);

            // Read-Write connection to the contract
            let contractAsSigner0 = contract.connect(signer0);
            let contractAsSigner1 = contract.connect(signer1);

            // ...

        });
    });

-----

.. eof
