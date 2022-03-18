# Accounts

Helper utilities for deriving account data from addresses or transactions.

## Data Types

```typescript
Account = {
    shard: bigint
    realm: bigint
    num: biginтъпеtypet
}

AccountLike = Account | string
```

## Functions

#### `hethers.utils.getAddressFromAccount(accountLike:` [`AccountLike`](accounts.md#data-types)`) => string` <a href="#utils.getaddressfromaccount" id="utils.getaddressfromaccount"></a>

Returns a hex representation of the provided account id.

```typescript
hethers.utils.getAddressFromAccount('0.0.1')
// 0x0000000000000000000000000000000000000001
```



#### `hethers.utils.getAccountFromAddress(address: string) =>` [`Account`](accounts.md#data-types)`` <a href="#utils.getaccountfromaddress" id="utils.getaccountfromaddress"></a>

Returns an [Account](accounts.md#data-types) object from the provided _ECDSA hash_.

```typescript
hethers.utils.getAccountFromAddress('0x0000000000000000000000000000000000000001')
// { shard: 0n, realm: 0n, num: 1n }
```



#### `hethers.utils.parseAccount(account: string) =>` [`Account`](accounts.md#data-types)`` <a href="#utils.parseaccount" id="utils.parseaccount"></a>

Returns an [Account](accounts.md#data-types) object from the provided string. Accepts either an _account id_ or _ECDSA hash_.

```typescript
hethers.utils.parseAccount('0x0000000000000000000000000000000000000001')
// { shard: 0n, realm: 0n, num: 1n }

hethers.utils.parseAccount('0.0.1')
// { shard: 0n, realm: 0n, num: 1n }
```



#### `hethers.utils.asAccountString(accountLike:` [`AccountLike`](accounts.md#data-types)`) => string` <a href="#utils.asaccountstring" id="utils.asaccountstring"></a>

Converts the provided [_AccountLike_](accounts.md#data-types) _data_ to an _AccountId._

```typescript
hethers.utils.asAccountString('0x0000000000000000000000000000000000000001')
// '0.0.1'
```



#### `hethers.utils.getAccountFromTransactionId( transactionId: string) => string` <a href="#utils.getaccountfromtransactionid" id="utils.getaccountfromtransactionid"></a>

Accepts a valid _TransactionId_ and extracts the accountId of the transation sender. Throws an `INVALID_ARGUMENT` error If an invalid _transactionId_ is provided.

```typescript
hethers.utils.getAccountFromTransactionId("0.0.99999999@9999999999-999999999")
// 0.0.99999999
```

