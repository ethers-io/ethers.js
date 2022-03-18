# Encoding Utilities

{% hint style="info" %}
The **Encoding Utilities** - _base58 and base64_ are directly imported from [The Ethers Project](https://github.com/ethers-io/ethers.js/). The complete documentation can be found in the official [ethers docs](https://docs.ethers.io/v5/api/utils/encoding/).
{% endhint %}

### Base58

#### `hethers.utils.base58.decode( textData ) ⇒ Uint8Array`

Return a typed Uint8Array representation of _textData_ decoded using base-58 encoding.

```typescript
base58.decode("TzMhH");
// Uint8Array [ 18, 52, 86, 120 ]
```

#### `hethers.utils.base58.encode( aBytesLike ) ⇒ string`

Return _aBytesLike_ encoded as a string using the base-58 encoding.

```typescript
base58.encode("0x12345678");
// 'TzMhH'

base58.encode([ 0x12, 0x34, 0x56, 0x78 ]);
// 'TzMhH'
```

### Base64

#### `hethers.utils.base64.decode( textData ) ⇒ Uint8Array`

Return a typed Uint8Array representation of _textData_ decoded using base-64 encoding.

```typescript
base64.decode("EjQ=");
// Uint8Array [ 18, 52 ]
```

#### `hethers.utils.base64.encode( aBytesLike ) ⇒ string`

Return _aBytesLike_ encoded as a string using the base-64 encoding.

```typescript
base64.encode("0x1234");
// 'EjQ='

base64.encode([ 0x12, 0x34 ]);
// 'EjQ='
```

\
