# Addresses

## Address Formats

### Address

An **Address** is a [_DataHexString_](byte-manipulation.md#datahexstring) of 20 bytes (40 nibbles), with optional mixed case.

If the case is mixed, it is a **Checksum Address**, which uses a specific pattern of uppercase and lowercase letters within a given address to reduce the risk of errors introduced from typing an address or cut and paste issues.

All functions that return an Address will return a Checksum Address.

### ICAP Address

The **ICAP Address Format** was an early attempt to introduce a checksum into Ethereum addresses using the popular banking industry's [IBAN](https://en.wikipedia.org/wiki/International\_Bank\_Account\_Number) format with the country code specified as **XE**.

Due to the way IBAN encodes address, only addresses that fit into 30 base-36 characters are actually compatible, so the format was adapted to support 31 base-36 characters which is large enough for a full Ethereum address, however the preferred method was to select a private key whose address has a `0` as the first byte, which allows the address to be formatted as a fully compatibly standard IBAN address with 30 base-36 characters.

In general this format is no longer widely supported anymore, however any function that accepts an address can receive an ICAP address, and it will be converted internally.

To convert an address into the ICAP format, see [getIcapAddress](addresses.md#utils.geticapaddress).

## Converting and Verifying

#### `hethers.utils.getAddress( address ) ⇒ string<`[`Address`](addresses.md#address)`>` <a href="#getaddress" id="getaddress"></a>

Returns _address_ as a Checksum Address.

If _address_ is an invalid 40-nibble [HexString](byte-manipulation.md#hexstring) or if it contains mixed case and the checksum is invalid, an [INVALID\_ARGUMENT](logging.md#logger.errors.invalid\_argument) Error is thrown.

The value of _address_ may be any supported address format.

```typescript
// Injects the checksum (via upper-casing specific letters)
hethers.utils.getAddress("0x8ba1f109551bd432803012645ac136ddd64dba72");
// '0x8ba1f109551bD432803012645Ac136ddd64DBA72'

// Converts and injects the checksum
hethers.utils.getAddress("XE65GB6LDNXYOFTX0NSV3FUWKOWIXAMJK36");
// '0x8ba1f109551bD432803012645Ac136ddd64DBA72'

// Throws if a checksummed address is provided, but a
// letter is the wrong case
// ------------v (should be lower-case)
hethers.utils.getAddress("0x8Ba1f109551bD432803012645Ac136ddd64DBA72")
// [Error: bad address checksum] {
//   argument: 'address',
//   code: 'INVALID_ARGUMENT',
//   reason: 'bad address checksum',
//   value: '0x8Ba1f109551bD432803012645Ac136ddd64DBA72'
// }

// Throws if the ICAP/IBAN checksum fails
hethers.utils.getIcapAddress("XE65GB6LDNXYOFTX0NSV3FUWKOWIXAMJK37");
// Error: INVALID_ARGUMENT

// Throws if the address is invalid, in general
hethers.utils.getIcapAddress("I like turtles!");
// Error: INVALID_ARGUMENT
```



#### `hethers.utils.getIcapAddress( address ) ⇒ string<`[`IcapAddress`](addresses.md#icap-address)`>` <a href="#utils.geticapaddress" id="utils.geticapaddress"></a>

Returns _address_ as an [ICAP address](addresses.md#icap-address). Supports the same restrictions as [_getAddress_](addresses.md#getaddress).

```typescript
getIcapAddress("0x8ba1f109551bd432803012645ac136ddd64dba72");
// 'XE65GB6LDNXYOFTX0NSV3FUWKOWIXAMJK36'

getIcapAddress("XE65GB6LDNXYOFTX0NSV3FUWKOWIXAMJK36");
// 'XE65GB6LDNXYOFTX0NSV3FUWKOWIXAMJK36'
```

#### &#x20;`hethers.utils.isAddress( address ) ⇒ boolean` <a href="#utils.isaddress" id="utils.isaddress"></a>

Returns true if _address_ is valid (in any supported format).

```typescript
isAddress("0x8ba1f109551bd432803012645ac136ddd64dba72");
// true

isAddress("XE65GB6LDNXYOFTX0NSV3FUWKOWIXAMJK36");
// true

isAddress("I like turtles.");
// false
```

## Derivation

#### `hethers.utils.computeAlias( publicKey ) ⇒ string` <a href="#utils.computeaddress" id="utils.computeaddress"></a>

Returns the _alias_ for the provided _publicKey_. The public key may be compressed or uncompressed.

```typescript
computeAlias("0x19ceac7a7132ac20b41bebca8f766ab79667fa6591277263f622385764d01ef5");
// '0.0.BHVfad0xeFdKiqt0O1pOpNouw0g4vZ6tEiuRlAW3BllfoW6sD75dxoMWtXEMakFaqEQFdALbkrsbFd1QNi+I0Zw='
```

#### `hethers.utils.getChecksumAddress( address ) => string<`[`Address`](addresses.md#address)`>` <a href="#utils.getchecksumaddress" id="utils.getchecksumaddress"></a>

Returns the checksum address for the provided ECDSA hash. Converts characters to upper or lower case in the correct locations.

```typescript
hethers.utils.getChecksumAddress("0x8ba1f109551bD432803012645Ac136ddd64DBA72")
// 0x8ba1f109551bD432803012645Ac136ddd64DBA72
```



#### `hethers.utils.getAccountFromTransactionId( transactionId ) => string`

Extracts the `AccountId` from the provided `transactionId.`

```typescript
getAccountFromTransactionId("0.0.1546615-1641987871-235099329")
// 0.0.1546615
```

#### ``

#### `hethers.utils.asAccountString( accountLike:` [`AccountLike`](accounts.md#data-types) `) => string`

Converts the provided [`AccountLike`](accounts.md#data-types) to an `AccountId string.`

```typescript
asAccountString("0x0000000000000000000000000000000000000001")
// 0.0.1
```

### Contract Addresses

#### &#x20;`hethers.utils.getCreate2Address( from , salt , initCodeHash ) ⇒ string<`[`Address`](addresses.md#address)`>` <a href="#utils.getcreate2address" id="utils.getcreate2address"></a>

Returns the contract address that would result from the given [_CREATE2_](https://eips.ethereum.org/EIPS/eip-1014) call.

```typescript
const from = "0x8ba1f109551bD432803012645Ac136ddd64DBA72";
const salt = "0x7c5ea36004851c764c44143b1dcb59679b11c9a68e5f41497f6cf3d480715331";
const initCode = "0x6394198df16000526103ff60206004601c335afa6040516060f3";
const initCodeHash = keccak256(initCode);

getCreate2Address(from, salt, initCodeHash);
// '0x533ae9d683B10C02EbDb05471642F85230071FC3'
```
