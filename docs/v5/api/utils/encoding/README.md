-----

Documentation: [html](https://docs.ethers.io/)

-----

Encoding Utilities
==================

Base58
------

#### *ethers* . *utils* . *base58* . **decode**( textData ) => *Uint8Array*

Return a typed Uint8Array representation of *textData* decoded using base-58 encoding.


```javascript
//_hide: const base58 = ethers.utils.base58;

//_result:
base58.decode("TzMhH");
//_log:
```

#### *ethers* . *utils* . *base58* . **encode**( aBytesLike ) => *string*

Return *aBytesLike* encoded as a string using the base-58 encoding.


```javascript
//_hide: const base58 = ethers.utils.base58;

//_result:
base58.encode("0x12345678");
//_log:

//_result:
base58.encode([ 0x12, 0x34, 0x56, 0x78 ]);
//_log:
```

Base64
------

#### *ethers* . *utils* . *base64* . **decode**( textData ) => *Uint8Array*

Return a typed Uint8Array representation of *textData* decoded using base-64 encoding.


```javascript
//_hide: const base64 = ethers.utils.base64;

//_result:
base64.decode("EjQ=");
//_log:
```

#### *ethers* . *utils* . *base64* . **encode**( aBytesLike ) => *string*

Return *aBytesLike* encoded as a string using the base-64 encoding.


```javascript
//_hide: const base64 = ethers.utils.base64;

//_result:
base64.encode("0x1234");
//_log:

//_result:
base64.encode([ 0x12, 0x34 ]);
//_log:
```

Recursive-Length Prefix
-----------------------

#### *ethers* . *utils* . *RLP* . **encode**( dataObject ) => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString) >*

Encode a structured [Data Object](/v5/api/utils/encoding/#rlp--dataobject) into its RLP-encoded representation.


```javascript
//_hide: const RLP = ethers.utils.RLP;

//_result:
RLP.encode("0x12345678");
//_log:

//_result:
RLP.encode([ "0x12345678" ]);
//_log:

//_result:
RLP.encode([ new Uint8Array([ 0x12, 0x34, 0x56, 0x78 ]) ]);
//_log:

//_result:
RLP.encode([ [ "0x42", [ "0x43" ] ], "0x12345678", [ ] ]);
//_log:

//_result:
RLP.encode([ ]);
//_log:
```

#### *ethers* . *utils* . *RLP* . **decode**( aBytesLike ) => *[DataObject](/v5/api/utils/encoding/#rlp--dataobject)*

Decode an RLP-encoded *aBytesLike* into its structured [Data Object](/v5/api/utils/encoding/#rlp--dataobject).

All Data components will be returned as a [DataHexString](/v5/api/utils/bytes/#DataHexString).


```javascript
//_hide: const RLP = ethers.utils.RLP;

//_result:
RLP.decode("0x8412345678");
//_log:

//_result:
RLP.decode("0xcac342c1438412345678c0");
//_log:

//_result:
RLP.decode("0xc0");
//_log:
```

### Data Object

#### **Examples**

- `"0x1234"` 
- `[ "0x1234", [ "0xdead", "0xbeef" ], [ ] ]` 




