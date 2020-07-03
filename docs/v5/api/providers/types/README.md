-----

Documentation: [html](https://docs.ethers.io/)

-----

Types
=====

BlockTag
--------

### EventType

Network
-------

#### *network* . **name** => *string*

The human-readable name of the network, such as `homestead`. If the network name is unknown, this will be `"unknown"`.


#### *network* . **chainId** => *number*

The Chain ID of the network.


#### *network* . **ensAddress** => *string< [Address](/v5/api/utils/address/#address) >*

The address at which the ENS registry is deployed on this network.


Block
-----

#### *block* . **hash** => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString)< 32 > >*

The hash of this block.


#### *block* . **parentHash** => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString)< 32 > >*

The hash of the previous block.


#### *block* . **number** => *number*

The height (number) of this block.


#### *block* . **timestamp** => *number*

The timestamp of this block.


#### *block* . **nonce** => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString) >*

The nonce used as part of the proof-of-work to mine this block.

This property is generally of little interest developers.


#### *block* . **difficulty** => *number*

The difficulty target required to be met by the miner of the block.

This property is generally of little interest developers.


#### *block* . **gasLimit** => *[BigNumber](/v5/api/utils/bignumber/)*

The maximum amount of gas that this block was permitted to use. This is a value that can be voted up or voted down by miners and is used to automatically adjust the bandwidth requirements of the network.

This property is generally of little interest developers.


#### *block* . **gasUsed** => *[BigNumber](/v5/api/utils/bignumber/)*

The total amount of gas used by all transactions in this block.


#### *block* . **miner** => *string*

The coinbase address of this block, which indicates the address the miner that mined this block would like the subsidy reward to go to.


#### *block* . **extraData** => *string*

This is extra data a miner may choose to include when mining a block.

This property is generally of little interest developers.


### Block (with transaction hashes)

#### *block* . **transactions** => *Array< string< [DataHexString](/v5/api/utils/bytes/#DataHexString)< 32 > > >*

A list of the transactions hashes for each transaction this block includes.


### BlockWithTransactions

#### *block* . **transactions** => *Array< [TransactionResponse](/v5/api/providers/types/#providers-TransactionResponse) >*

A list of the transactions this block includes.


Events and Logs
---------------

### EventFilter

#### *filter* . **address** => *string< [Address](/v5/api/utils/address/#address) >*

The address to filter by, or `null` to match any address.


#### *filter* . **topics** => *Array< string< [DataHexString](/v5/api/utils/bytes/#DataHexString)< 32 > > | Array< string< [DataHexString](/v5/api/utils/bytes/#DataHexString)< 32 > > > >*

The topics to filter by, or `null` to match any topics. Each entry represents an **AND** condition that must match, or may be `null` to match anything. If a given entry is an Array, then that entry is treated as an **OR** for any value in the entry.


### Filter

#### *filter* . **fromBlock** => *[BlockTag](/v5/api/providers/types/#providers-BlockTag)*

The starting block (inclusive) to search for logs matching the filter criteria.


#### *filter* . **toBlock** => *[BlockTag](/v5/api/providers/types/#providers-BlockTag)*

The end block (inclusive) to search for logs matching the filter criteria.


### FilterByBlockHash

#### *filter* . **blockHash** => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString)< 32 > >*

The specific block (by its block hash) to search for logs matching the filter criteria.


### Log

#### *log* . **blockNumber** => *number*

The block height (number) of the block including the transaction of this log.


#### *log* . **blockHash** => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString)< 32 > >*

The block hash of the block including the transaction of this log.


#### *log* . **removed** => *boolean*

During a re-org, if a transaction is orphaned, this will be set to true to indicate the Log entry has been removed; it will likely be emitted again in the near future when another block is mined with the transaction that triggered this log, but keep in mind the values may change.


#### *log* . **transactionLogIndex** => *number*

The index of this log in the transaction.


#### *log* . **address** => *string< [Address](/v5/api/utils/address/#address) >*

The address of the contract that generated this log.


#### *log* . **data** => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString) >*

The data included in this log.


#### *log* . **topics** => *Array< string< [DataHexString](/v5/api/utils/bytes/#DataHexString)< 32 > > >*

The list of topics (indexed properties) for this log.


#### *log* . **transactionHash** => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString)< 32 > >*

The transaction hash of the transaction of this log.


#### *log* . **transactionIndex** => *number*

The index of the transaction in the block of the transaction of this log.


#### *log* . **logIndex** => *number*

The index of this log across all logs in the entire **block**.


Transactions
------------

### TransactionRequest

#### *transactionRequest* . **to** => *string | Promise< string >*

The address (or ENS name) this transaction it to.


#### *transactionRequest* . **from** => *string< [Address](/v5/api/utils/address/#address) > | Promise< string< [Address](/v5/api/utils/address/#address) > >*

The address this transaction is from.


#### *transactionRequest* . **nonce** => *number | Promise< number >*

The nonce for this transaction. This should be set to the number of transactions ever sent **from** this address.


#### *transactionRequest* . **gasLimit** => *[BigNumber](/v5/api/utils/bignumber/) | Promise< [BigNumber](/v5/api/utils/bignumber/) >*

The maximum amount of gas this transaction is permitted to use.


#### *transactionRequest* . **gasPrice** => *[BigNumber](/v5/api/utils/bignumber/) | Promise< [BigNumber](/v5/api/utils/bignumber/) >*

The price (in wei) per unit of gas this transaction will pay.


#### *transactionRequest* . **data** => *[DataHexString](/v5/api/utils/bytes/#DataHexString) | Promise< [DataHexString](/v5/api/utils/bytes/#DataHexString) >*

The transaction data.


#### *transactionRequest* . **value** => *[BigNumber](/v5/api/utils/bignumber/) | Promise< [BigNumber](/v5/api/utils/bignumber/) >*

The amount (in wei) this transaction is sending.


#### *transactionRequest* . **chainId** => *number | Promise< number >*

The chain ID this transaction is authorized on, as specified by [EIP-155](https://eips.ethereum.org/EIPS/eip-155).

If the chain ID is 0 will disable EIP-155 and the transaction will be valid on any network. This can be **dangerous** and care should be taken, since it allows transactions to be replayed on networks that were possibly not intended.


### TransactionResponse

#### *transaction* . **blockNumber** => *number*

The number ("height") of the block this transaction was mined in. If the block has not been mined, this is `null`.


#### *transaction* . **blockHash** => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString)< 32 > >*

The hash of the block this transaction was mined in. If the block has not been mined, this is `null`.


#### *transaction* . **timestamp** => *number*

The timestamp of the block this transaction was mined in. If the block has not been mined, this is `null`.


#### *transaction* . **confirmations** => *number*

The number of blocks that have been mined (including the initial block) since this transaction was mined.


#### *transaction* . **raw** => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString) >*

The serialized transaction.


#### *transaction* . **wait**( [ confirmations = 1 ] ) => *Promise< [TransactionReceipt](/v5/api/providers/types/#providers-TransactionReceipt) >*

Wait for *confirmations*. If 0, and the transaction has not been mined, `null` is returned.


### TransactionReceipt

#### *receipt* . **to** => *string< [Address](/v5/api/utils/address/#address) >*

The address this transaction is to. This is `null` if the the transaction was an **init transaction**, used to deploy a contract.


#### *receipt* . **from** => *string< [Address](/v5/api/utils/address/#address) >*

The address this transaction is from.


#### *receipt* . **contractAddress** => *string< [Address](/v5/api/utils/address/#address) >*

If this transaction has a `null` to address, it is an **init transaction** used to deploy a contract, in which case this is the address created by that contract.

To compute a contract address, the [getContractAddress](/v5/api/utils/address/#utils-getContractAddress) utility function can also be used with a [TransactionResponse](/v5/api/providers/types/#providers-TransactionResponse) object, which requires the transaction nonce and the address of the sender.


#### *receipt* . **transactionIndex** => *number*

The index of this transaction in the list of transactions included in the block this transaction was mined in.


#### *receipt* . **root** => *string*

The intermediate state root of a receipt.

Only transactions included in blocks **before** the [Byzantium Hard Fork](https://eips.ethereum.org/EIPS/eip-609) have this property, as it was replaced by the `status` property.

The property is generally of little use to developers. At the time it could be used to verify a state transition with a fraud-proof only considering the single transaction; without it the full block must be considered.


#### *receipt* . **gasUsed** => *[BigNumber](/v5/api/utils/bignumber/)*

The amount of gas actually used by this transaction.


#### *receipt* . **logsBloom** => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString) >*

A [bloom-filter](https://en.wikipedia.org/wiki/Bloom_filter), which incldues all the addresses and topics included in any log in this transaction.


#### *receipt* . **blockHash** => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString)< 32 > >*

The block hash of the block that this transaction was included in.


#### *receipt* . **transactionHash** => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString)< 32 > >*

The transaction hash of this transaction.


#### *receipt* . **logs** => *Array< [Log](/v5/api/providers/types/#providers-Log) >*

All the logs emitted by this transaction.


#### *receipt* . **blockNumber** => *number*

The block height (number) of the block that this transaction was included in.


#### *receipt* . **confirmations** => *number*

The number of blocks that have been mined since this transaction, including the actual block it was mined in.


#### *receipt* . **cumulativeGasUsed** => *[BigNumber](/v5/api/utils/bignumber/)*

For the block this transaction was included in, this is the sum of the gas used used by each transaction in the ordered list of transactions up to (and including) this transaction.

This is generally of little interest to developers.


#### *receipt* . **byzantium** => *boolean*

This is true if the block is in a [post-Byzantium Hard Fork](https://eips.ethereum.org/EIPS/eip-609) block.


#### *receipt* . **status** => *boolean*

The status of a transaction is 1 is successful or 0 if it was reverted. Only transactions included in blocks [post-Byzantium Hard Fork](https://eips.ethereum.org/EIPS/eip-609) have this property.


