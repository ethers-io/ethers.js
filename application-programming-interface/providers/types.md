# Types

### Networkish

A **Networkish** may be any of the following:

* a [Network](types.md#network) object
* the name of a common network as a string (e.g. `"mainnet"`)
* the chain ID a network as a number; if the chain ID is that of a common network, the `name` will be populated, otherwise, the default name `"unknown"` is used

### Network

A **Network** represents a Hedera network.

#### network.name ⇒ string

&#x20;   The human-readable name of the network, such as `mainnet`. If the network name is unknown, this will be `"unknown"`.

#### network.chainId ⇒ number

&#x20;   The Chain ID of the network.

### AccountLike

Used thoroughly in the hethers library to represent accounts/contracts/addresses in various forms.

```typescript
/**
 * `0x0000000000000000000000000000000000000001`
 * `0.0.1`
 * Account{shard:0, realm:0, num: 1}
 */
type AccountLike = Account | string;
```

### Events and Logs

### EventFilter

#### filter.address ⇒ [accountLike](types.md#accountlike)

&#x20;   The address to filter by, or `null` to match any address.

#### filter.topics ⇒ Array< string< Data< 32 > > | Array< string< Data< 32 > > > >

&#x20;   The topics to filter by or `null` to match any topics.

&#x20;   Each entry represents an **AND** condition that must match, or may be `null` to match anything. If a given entry is an Array, then that entry is treated as an **OR** for any value in the entry.

&#x20;   See Filters for more details and examples on specifying complex filters.

### **Filter (**inherits **EventFilter)**

#### filter.fromTimestamp ⇒ string | number

&#x20;   The starting timestamp (inclusive) to search for logs matching the filter criteria.

#### filter.toTimestamp ⇒ string | number

&#x20;   The end timestamp (inclusive) to search for logs matching the filter criteria.

### Log

#### log.transactionLogIndex ⇒ number

&#x20;   The index of this log in the transaction.

#### log.address ⇒ [accountLike](types.md#accountlike)

&#x20;   The address of the contract that generated this log.

#### log.data ⇒ string< [DataHexString ](../utilities/byte-manipulation.md#datahexstring)>

&#x20;   The data included in this log.

#### log.topics ⇒ Array< string< [DataHexString](../utilities/byte-manipulation.md#datahexstring)< 32 > > >

&#x20;   The list of topics (indexed properties) for this log.

#### log.transactionHash ⇒ string< [DataHexString](../utilities/byte-manipulation.md#datahexstring)< 48 > >

&#x20;   The transaction hash of the transaction of this log.

#### log.transactionIndex ⇒ number

&#x20;   The index of this log in the transaction.

#### log.logIndex ⇒ number

&#x20;   The index of this log in the transaction.

### Transactions

### TransactionRequest

&#x20;   A transaction request describes a transaction that is to be sent to the network or otherwise processed.

&#x20;   All fields are optional and may be a promise which resolves to the required type.

#### transactionRequest.to ⇒ [accountLike](types.md#accountlike) | Promise< [accountLike](types.md#accountlike) >

&#x20;   The address this transaction it to.

#### transactionRequest.from ⇒ [accountLike](types.md#accountlike) | Promise< [accountLike](types.md#accountlike) >

&#x20;   The address this transaction is from.

#### transactionRequest.data ⇒ [DataHexString ](../utilities/byte-manipulation.md#datahexstring)| Promise< [DataHexString ](../utilities/byte-manipulation.md#datahexstring)>

&#x20;   The transaction data.

#### transactionRequest.value ⇒ [BigNumber ](../utilities/bignumber.md)| Promise< [BigNumber ](../utilities/bignumber.md)>

&#x20;   The amount (in tinybars) this transaction is sending.

#### transactionRequest.gasLimit ⇒ [BigNumber ](../utilities/bignumber.md)| Promise< [BigNumber ](../utilities/bignumber.md)>

&#x20;   The maximum amount of gas this transaction is permitted to use.

#### transactionRequest.chainId ⇒ number | Promise< number >

&#x20;   The chain ID this transaction is authorized on.

#### transactionRequest.type ⇒ null | number

&#x20;   Types will always be `0` in Hedera since envelope types are not supported as of now.

#### transactionRequest.accessList ⇒ AccessListish

&#x20;   Currently not supported in Hedera.

#### transactionRequest.customData ⇒ Record\<string, any>

&#x20;   Any custom data as key-value pairs.

### **TransactionResponse**&#x20;

inherits **Transaction**

A **TransactionResponse** includes all properties of a Transaction as well as several properties that are useful once it has been mined.

#### transaction.timestamp ⇒ string

&#x20;   The timestamp of the transaction. If the transaction has not been mined, this is `null`.

#### transaction.raw ⇒ string< [DataHexString ](../utilities/byte-manipulation.md#datahexstring)>

&#x20;   The serialized transaction. This may be null as some backends do not rpopulate it. If this is required, it can be computed from a **TransactionResponse**.

#### transaction.wait( \[ timeout ] ) ⇒ Promise< [TransactionReceipt ](types.md#transactionrequest)>

&#x20;   Resolves to the TransactionReceipt once the transaction has been mined. If _timeout_ is not provided, and the transaction has not been mined, `null` is returned.

&#x20;   If the transaction execution failed (i.e. the receipt status is `0`), a `CALL_EXCEPTION` error will be rejected with the following properties:

* `error.transaction` - the original transaction
* `error.transactionHash` - the hash of the transaction
* `error.receipt` - the actual receipt, with the status of `0`

### TransactionReceipt

#### receipt.to ⇒ string < [Address](../utilities/addresses.md#address) >

&#x20;   The address this transaction is to. This is `null` if the transaction was an **init transaction**, used to deploy a contract.

#### receipt.from ⇒ string < [Address](../utilities/addresses.md#address) >

&#x20;   The address this transaction is from.

#### receipt.contractAddress ⇒ string < [Address](../utilities/addresses.md#address) >

&#x20;   If this transaction has a `null` to address, it is an **init transaction** used to deploy a contract, in which case this is the address created by that contract.

&#x20;   To compute a contract address, the **getContractAddress** utility function can also be used with a TransactionResponse object, which requires the transaction nonce and the address of the sender.

#### receipt.type ⇒ number

&#x20;   Types will always be `0` in Hedera since envelope types are not supported as of now.

#### receipt.gasUsed ⇒ [BigNumber](../utilities/bignumber.md)

&#x20;   The amount of gas actually used by this transaction.

#### receipt.logsBloom ⇒ string< [DataHexString ](../utilities/byte-manipulation.md#datahexstring)>

&#x20;   A [bloom-filter](https://en.wikipedia.org/wiki/Bloom\_filter), which includes all the addresses and topics included in any log in this transaction.

#### receipt.transactionHash ⇒ string< [DataHexString](../utilities/byte-manipulation.md#datahexstring)< 48 > >

&#x20;   The transaction hash of this transaction.

#### receipt.logs ⇒ Array< [Log ](types.md#log)>

&#x20;   All the logs emitted by this transaction.

#### receipt.cumulativeGasUsed ⇒ [BigNumber](../utilities/bignumber.md)

&#x20;   This is the sum of the gas used by the transaction, equals the `gasUsed` property.

&#x20;   This is generally of little interest to developers.

#### receipt.byzantium ⇒ boolean

&#x20;   This is true if the block is in a [post-Byzantium Hard Fork](https://eips.ethereum.org/EIPS/eip-609) block.

#### receipt.status ⇒ number

&#x20;   The status of a transaction is 1 is successful or 0 if it was reverted. Only transactions included in blocks [post-Byzantium Hard Fork](https://eips.ethereum.org/EIPS/eip-609) have this property.
