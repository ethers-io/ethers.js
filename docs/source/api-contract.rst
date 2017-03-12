Contracts
*********

What are contracts... The preferred way to interact with code liivng on the
blockchain, but require converting 

Contracts consist of two kinds of functions that can be called

Synchronous
    A contract function which is marked as **constant** is *free* and does
    not affect the blockchain, and can return a value back to your code
    (via a promise, since communicating to the network is still
    asynchronous)

Asynchronous
    Any function which modifies the state of a contract costs *ether* be
    sent in a transaction, and requires wiating for a block to be mined for
    that transaction. These functions cannot return any values back to
    JavaScript (although the function in the contract may return a value, that
    value is only available to contracts calling that function)

Most of a contract is procedurally defined by the ABI provided, but in addition
to those functions, there are two properties which can (and ofter should) be set:


Creating
========

Examples
--------

Example::

    var foo


Name collisions
===============

Many contracts overload a methods signature, which cannot be don in JavaScript.
To get around this, several other accessor properties are created on the
Contract object.

Contract.prototype.execute
Contract.prototype.executeExplicit

Example::

    var foo


Interface
=========

Sometimes you may wish to deal with lower-level aspects of a contract and the
binary format which the Ethereum VM uses. For these purposes you can use the
Interface object, which is what the Contract object uses under the hood.


Example::

    var foo


Custom Signers
==============

The simplest way to specify a signer is to simply use an instance of a wallet.
However, if you wish to have more fine-tuned control over what is signed, you can
implement your own customer signer.

A signer is required to have teh following two properties:

**address**:
    Which must return a vaid address or a promise which will resolve to a valid
    address or reject an error.

**sign**:
    Which must return a valid hexString or a promise which will resolve to a valid
    signed transaction or reject an error.
