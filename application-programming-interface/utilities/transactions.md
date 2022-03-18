# Transactions

## Types

### UnsignedTransaction

An unsigned transaction represents a transaction that has not been signed and its values are flexible as long as they are not ambiguous.

#### `unsignedTransaction.to ⇒ string<`[`AccountLike`](accounts.md#data-types)`>`

The address this transaction is to.

#### `unsignedTransaction.from ⇒ string<`[`AccountLike`](accounts.md#data-types)`>`

The address initiating the transaction.

#### `unsignedTransaction.gasLimit ⇒` [`BigNumberish`](bignumber.md#bignumberish)``

The gas limit for this transaction. Read more about [gas reservation and unused gas refund](https://docs.hedera.com/guides/core-concepts/smart-contracts/gas-and-fees#gas-reservation-and-unused-gas-refund).

#### `unsignedTransaction.data ⇒` [`BytesLike`](transactions.md#transaction.data-byteslike)``

The data for this transaction.

#### `unsignedTransaction.value ⇒` [`BigNumberish`](bignumber.md#bignumberish)``

The value (in tinybar) for this transaction

#### `unsignedTransaction.chainId ⇒ number`

The chain ID for this transaction.

#### `unsignedTransaction.type ⇒ number`

The type of this transaction. The type is always `0` for now.

#### `unsignedTransaction.accessList ⇒` [`AccessListish`](transactions.md#accesslistish)

The **AccessList** of this transaction. Currently `accessLists` are not supported in Hedera.

#### `unsignedTransaction.nodeId ⇒` [`AccountLike`](accounts.md#data-types)``

The ID of the target node.

#### `unsignedTransaction.customData ⇒ Record<string, any>`

Can contain any kind of data for custom logic.

### Transaction

A generic object to represent a transaction.

#### `transaction.transactionId => string`

The [`transactionId`](https://docs.hedera.com/guides/docs/hedera-api/basic-types/transactionid) of the transaction. Can be in one of the following formats:&#x20;

#### `transaction.hash ⇒ string<`[`DataHexString`](byte-manipulation.md#datahexstring)`<32>>`

The transaction hash, which can be used as an identifier for _transaction_. This is the keccak256 of the serialized RLP encoded representation of _transaction_.

#### `transaction.to ⇒ string<`[`Address`](addresses.md#address)`>`

The address _transaction_ is to.

#### `transaction.from ⇒ string<`[`Address`](addresses.md#address)`>`

The address _transaction_ is from.

#### `transaction.nonce ⇒ number`

The nonce for _transaction_. Each transaction sent to the network from an account includes this, which ensures the order and non-replayability of a transaction. This must be equal to the current number of transactions ever sent to the network by the **from** address.

#### `transaction.gasLimit ⇒` [`BigNumber`](bignumber.md)``

The gas limit for _transaction_. Read more about [gas reservation and unused gas refund](https://docs.hedera.com/guides/core-concepts/smart-contracts/gas-and-fees#gas-reservation-and-unused-gas-refund).

#### `transaction.data ⇒` [`BytesLike`](byte-manipulation.md#byteslike)``

The data for _transaction_. In a contract this is the call data.

#### `transaction.value ⇒` [`BigNumber`](bignumber.md)``

The value (in tinybars) for _transaction_.

#### `transaction.chainId ⇒ number`

The chain ID for _transaction_.&#x20;

### AccessListish

```typoscript
type AccessListish = AccessList |
         Array<[string, Array<string>]> |
         Record<string, Array<string>>
```

## HederaTransaction

### Functions

#### `hethers.utils.accessListify( anAcceslistish ) ⇒ AccessList`

Normalizes the AccessListish _anAccessListish_ into an AccessList.

This is useful for other utility functions which wish to remain flexible as to the input parameter for access lists, such as when creating a Signer which needs to manipulate a possibly typed transaction envelope.

#### `hethers.utils.parseTransaction( aBytesLike ) ⇒` [`Transaction`](transactions.md#transaction)``

Parses the transaction properties from a serialized transaction.

