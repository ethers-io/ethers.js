-----

Documentation: [html](https://docs-beta.ethers.io/)

-----

Types
=====



BlockTag
--------


A **BlockTag** specifies a specific location in the Blockchain.



* **`"latest"`** -- The most recently mined block
* **`"earliest"`** -- Block #0
* **`"pending"`** -- The block currently being prepared for mining; not all operations and backends support this BlockTag
* ***number*** -- The block at this height
* ***a negative number*** -- The block this many blocks ago


### EventType


And **EventType** can be any of the following.



* ***string*** -- TODO...
* ***Array<string<[DataHexstring](../../utils/bytes)<32>> | Array<string<[DataHexstring](../../utils/bytes)<32>>>>*** -- TODO...
* ***[EventFilter](./)*** -- TODO...


Network
-------


A **Network** represents an Etherem network.


#### *network* . **name** **=>** *string*

The human-readable name of the network, such as `homestead`. If the network
name is unknown, this will be `"unknown"`.




#### *network* . **chainId** **=>** *number*

The Chain ID of the network.




#### *network* . **ensAddress** **=>** *string< [Address](../../utils/address) >*

The address at which the ENS registry is deployed on this network.




Block
-----



#### *block* . **hash** **=>** *string< [DataHexstring](../../utils/bytes)< 32 > >*

The hash of this block.




#### *block* . **parentHash** **=>** *string< [DataHexstring](../../utils/bytes)< 32 > >*

The hash of the previous block.




#### *block* . **number** **=>** *number*

The height (number) of this block.




#### *block* . **timestamp** **=>** *number*

The timestamp of this block.




#### *block* . **nonce** **=>** *string< [DataHexstring](../../utils/bytes) >*

The nonce used as part of the proof-of-work to mine this block.

This property is generally of little interest developers.




#### *block* . **difficulty** **=>** *number*

The difficulty target required to be met by the miner of the block.

This property is generally of little interest developers.




#### *block* . **gasLimit** **=>** *[BigNumber](../../utils/bignumber)*

The maximum amount of gas that this block was permitted to use. This
is a value that can be voted up or voted down by miners and is used
to automatically adjust the bandwidth requirements of the network.

This property is generally of little interest developers.




#### *block* . **gasUsed** **=>** *[BigNumber](../../utils/bignumber)*

The total amount of gas used by all transactions in this block.




#### *block* . **miner** **=>** *string*

The coinbase address of this block, which indicates the address the
miner that mined this block would like the subsidy reward to go to.




#### *block* . **extraData** **=>** *string*

This is extra data a miner may choose to include when mining a block.

This property is generally of little interest developers.




### Block (with transaction hashes)


Often only the hashes of the transactions included in a block are needed,
so by default a block only contains this information, as it is
substantially less data.


#### *block* . **transactions** **=>** *Array< string< [DataHexstring](../../utils/bytes)< 32 > > >*

A list of the transactions hashes for each transaction this block
includes.




### BlockWithTransactions


If all transactions for a block are needed, this object instead includes
the full details on each transaction.


#### *block* . **transactions** **=>** *Array< [TransactionResponse](./) >*

A list of the transactions this block includes.




Events and Logs
---------------



### EventFilter



#### *filter* . **address** **=>** *string< [Address](../../utils/address) >*

The address to filter by, or `null` to match any address.




#### *filter* . **topics** **=>** *Array< string< [DataHexstring](../../utils/bytes)< 32 > >|Array< string< [DataHexstring](../../utils/bytes)< 32 > > > >*

The topics to filter by, or `null` to match any topics. Each entry represents an
**AND** condition that must match, or may be `null` to match anything. If a given
entry is an Array, then that entry is treated as an **OR** for any value in the entry.




### Filter



#### *filter* . **fromBlock** **=>** *[BlockTag](./)*

The starting block (inclusive) to search for logs matching the filter criteria.




#### *filter* . **toBlock** **=>** *[BlockTag](./)*

The end block (inclusive) to search for logs matching the filter criteria.




### FilterByBlockHash



#### *filter* . **blockHash** **=>** *string< [DataHexstring](../../utils/bytes)< 32 > >*

The specific block (by its block hash) to search for logs matching the filter criteria.




### Log



#### *log* . **blockNumber** **=>** *number*

The block height (number) of the block including the transaction of this log.




#### *log* . **blockHash** **=>** *string< [DataHexstring](../../utils/bytes)< 32 > >*

The block hash of the block including the transaction of this log.




#### *log* . **removed** **=>** *boolean*

During a re-org, if a transaction is orphaned, this will be set to true
to indicate the Log entry has been removed; it will likely be emitted
again in the near future when another block is mined with the transaction
that triggered this log, but keep in mind the values may change.




#### *log* . **transactionLogIndex** **=>** *number*

The index of this log in the transaction.




#### *log* . **address** **=>** *string< [Address](../../utils/address) >*

The address of the contract that generated this log.




#### *log* . **data** **=>** *string< [DataHexstring](../../utils/bytes) >*

The data included in this log.




#### *log* . **topics** **=>** *Array< string< [DataHexstring](../../utils/bytes)< 32 > > >*

The list of topics (indexed properties) for this log.




#### *log* . **transactionHash** **=>** *string< [DataHexstring](../../utils/bytes)< 32 > >*

The transaction hash of the transaction of this log.




#### *log* . **transactionIndex** **=>** *number*

The index of the transaction in the block of the transaction of this log.




#### *log* . **logIndex** **=>** *number*

The index of this log across all logs in the entire **block**.




Transactions
------------



### TransactionRequest


A transaction request describes a transaction that is to
be sent to the network or otherwise processed.

All fields are optional and may be a promise which resolves
to the required type.


#### *transactionRequest* . **to** **=>** *string|Promise< string >*

The address (or ENS name) this transaction it to.




#### *transactionRequest* . **from** **=>** *string< [Address](../../utils/address) >|Promise< string< [Address](../../utils/address) > >*

The address this transaction is from.




#### *transactionRequest* . **nonce** **=>** *number|Promise< number >*

The nonce for this transaction. This should be set to the number of
transactions ever sent **from** this address.




#### *transactionRequest* . **gasLimit** **=>** *[BigNumber](../../utils/bignumber)|Promise< [BigNumber](../../utils/bignumber) >*

The maximum amount of gas this transaction is permitted to use.




#### *transactionRequest* . **gasPrice** **=>** *[BigNumber](../../utils/bignumber)|Promise< [BigNumber](../../utils/bignumber) >*

The price (in wei) per unit of gas this transaction will pay.




#### *transactionRequest* . **data** **=>** *[DataHexstring](../../utils/bytes)|Promise< [DataHexstring](../../utils/bytes) >*

The transaction data.




#### *transactionRequest* . **value** **=>** *[BigNumber](../../utils/bignumber)|Promise< [BigNumber](../../utils/bignumber) >*

The amount (in wei) this transaction is sending.




#### *transactionRequest* . **chainId** **=>** *number|Promise< number >*

The chain ID this transaction is authorized on, as specified by
[EIP-155](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/eips.ethereum.org/EIPS/eip-155).

If the chain ID is 0 will disable EIP-155 and the transaction will be valid
on any network. This can be **dangerous** and care should be taken, since it
allows transactions to be replayed on networks that were possibly not
intended.




### TransactionResponse


A **TransactionResponse** includes all properties of a [Transaction](../../utils/transactions) as well as several
properties that are useful once it has been mined.


#### *transaction* . **blockNumber** **=>** *number*

The number ("height") of the block this transaction was mined in. If the block has not been mined,
this is `null`.




#### *transaction* . **blockHash** **=>** *string< [DataHexstring](../../utils/bytes)< 32 > >*

The hash of the block this transaction was mined in. If the block has not been mined,
this is `null`.




#### *transaction* . **timestamp** **=>** *number*

The timestamp of the block this transaction was mined in. If the block has not been mined,
this is `null`.




#### *transaction* . **confirmations** **=>** *number*

The number of blocks that have been mined (including the initial block) since this
transaction was mined.




#### *transaction* . **raw** **=>** *string< [DataHexstring](../../utils/bytes) >*

The serialized transaction.




#### *transaction* . **wait** (  [ confirmations=1 ]  )  **=>** *Promise< [TransactionReceipt](./) >*

Wait for *confirmations*. If 0, and the transaction has not been mined,
`null` is returned.




### TransactionReceipt



#### *receipt* . **to** **=>** *string< [Address](../../utils/address) >*

The address this transaction is to. This is `null` if the the
transaction was an **init transaction**, used to deploy a contract.




#### *receipt* . **from** **=>** *string< [Address](../../utils/address) >*

The address this transaction is from.




#### *receipt* . **contractAddress** **=>** *string< [Address](../../utils/address) >*

If this transaction has a ``null` to address, it is an **init transaction**
used to deploy a contract, in which case this is the address created by that
contract.

To compute a contract address, the [getContractAddress](../../utils/address)
utility function can also be used with a [TransactionResponse](./)
object, which requires the transaction nonce and the address of the sender.




#### *receipt* . **transactionIndex** **=>** *number*

The index of this transaction in the list of transactions included in
the block this transaction was mined in.




#### *receipt* . **root** **=>** *string*

The intermediate state root of a receipt.

Only transactions included in blocks **before** the [Byzantium Hard Fork](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/eips.ethereum.org/EIPS/eip-609)
have this property, as it was replaced by the `status` property.

The property is generally of little use to developers. At the time
it could be used to verify a state transition with a fraud-proof
only considering the single transaction; without it the full block
must be considered.




#### *receipt* . **gasUsed** **=>** *[BigNumber](../../utils/bignumber)*

The amount of gas actually used by this transaction.




#### *receipt* . **logsBloom** **=>** *string< [DataHexstring](../../utils/bytes) >*

A [bloom-filter](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/en.wikipedia.org/wiki/Bloom_filter), which
incldues all the addresses and topics included in any log in this
transaction.




#### *receipt* . **blockHash** **=>** *string< [DataHexstring](../../utils/bytes)< 32 > >*

The block hash of the block that this transaction was included in.




#### *receipt* . **transactionHash** **=>** *string< [DataHexstring](../../utils/bytes)< 32 > >*

The transaction hash of this transaction.




#### *receipt* . **logs** **=>** *Array< [Log](./) >*

All the logs emitted by this transaction.




#### *receipt* . **blockNumber** **=>** *number*

The block height (number) of the block that this transaction was
included in.




#### *receipt* . **confirmations** **=>** *number*

The number of blocks that have been mined since this transaction,
including the actual block it was mined in.




#### *receipt* . **cumulativeGasUsed** **=>** *[BigNumber](../../utils/bignumber)*

For the block this transaction was included in, this is the sum of the
gas used used by each transaction in the ordered list of transactions
up to (and including) this transaction.

This is generally of little interest to developers.




#### *receipt* . **byzantium** **=>** *boolean*

This is true if the block is in a [post-Byzantium Hard Fork](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/eips.ethereum.org/EIPS/eip-609)
block.




#### *receipt* . **status** **=>** *boolean*

The status of a transaction is 1 is successful or 0 if it was
reverted. Only transactions included in blocks [post-Byzantium Hard Fork](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/eips.ethereum.org/EIPS/eip-609)
have this property.





-----
**Content Hash:** 911f42520657ebece6d9fe0456cae0540134758a7253057c42acffac94fb0895