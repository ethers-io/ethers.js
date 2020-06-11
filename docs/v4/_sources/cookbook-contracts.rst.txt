Contracts
*********

Some quick examples for techniques with Contracts.

-----

Return a Value from a State-Changing Method
===========================================

Since a state-changing (non-constant) function can take a non-trivial
amount of time to mine, the response is a transaction, and cannot
return values directly.

Using events, we can simulate a return value from a non-constant function.

.. code-block:: javascript
    :caption: *Solidity*

    contract Example {
        event Return(uint256);

        uint256 _accum = 0;

        function increment() returns (uint256 sum) {
            _accum++;
            Returns(_accum);
        }
    }

.. code-block:: javascript
    :caption: *JavaScript*

    const assert = require('assert')

    const {
        Contract,
        Wallet,
        getDefaultProvider
    } = require('ethers')

    const provider = getDefaultProvider('ropsten')

    const wallet = new Wallet(privateKey, provider)

    const abi = [
        "event Return(uint256)",
        "function increment() returns (uint256 sum)"
    ]

    const contractAddress = "0x..."

    const contract = new Contract(contractAddress, abi)

    async function increment() {

        // Call the contract, getting back the transaction
        let tx = await contract.increment()

        // Wait for the transaction to have 2 confirmations.
        // See the note below on "Economic Value" for considerations
        // regarding the number of suggested confirmations
        let receipt = await tx.wait(2)

        // The receipt will have an "events" Array, which will have
        // the emitted event from the Contract. The "Return(uint256)"
        // call is the last event.
        let sumEvent = receipt.events.pop()

        // Not necessary; these are just for the purpose of this
        // example
        assert.equal(sumEvent.event, 'Return')
        assert.equal(sumEvent.eventSignature, 'Return(uint256)')

        // The sum is the first (and in this case only) parameter
        // in the "Return(uint256 sum)" event
        let sum = sumEvent.args[0]

        return sum
    }

    increment.then((value) => {
        console.log(value);
    });

-----

Economic Incentives and Economic Value
======================================

A very important aspect of Smart Contracts is consideration of the
Economic Value being protected; even a completely logically correct
Smart Contract can fall victim to misaligned economic incentives.

Imagine a city with an average parking ticket cost of $60, but the
parking enforcement is not effective, allowing a person to park anytime
and anywhere with only an average of 3 tickets per year. If
the average cost to pay for parking is $10, and you park 100 times per year,
the $180 in fines compared to the $1,000 in paying for parking is actually
incentivizing illegal parking and disincentivizing paying legitimate parking.

This is a fairly involved topic, which we will write an article for
and then link to from here, along with a related topic, "Miner
Front-Running".

-----

.. eof
