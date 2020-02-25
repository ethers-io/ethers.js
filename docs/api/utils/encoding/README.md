-----

Documentation: [html](https://docs-beta.ethers.io/)

-----

Encoding Utilities
==================



Base58
------



#### *ethers* . *utils* . *base58* . **decode** ( textData )  **=>** *Uin8Array*

Return a typed Uint8Array representation of *textData* decoded using
base-58 encoding.




#### *ethers* . *utils* . *base58* . **encode** ( aBytesLike )  **=>** *string*

Return *aBytesLike* encoded as a string using the base-58 encoding.




Base64
------



#### *ethers* . *utils* . *base64* . **decode** ( textData )  **=>** *Uin8Array*

Return a typed Uint8Array representation of *textData* decoded using
base-64 encoding.




#### *ethers* . *utils* . *base64* . **encode** ( aBytesLike )  **=>** *string*

Return *aBytesLike* encoded as a string using the base-64 encoding.




Recursive-Length Prefix
-----------------------


The [Recursive Length Prefix](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/github.com/ethereum/wiki/wiki/RLP) encoding is used throughout Ethereum to serialize nested
structures of Arrays and data.


#### *ethers* . *utils* . *RLP* . **encode** ( dataObject )  **=>** *string< [DataHexstring](../bytes) >*

Encode a structured Data Object into its RLP-encoded representation.

Each Data component may be an valid [BytesLike](../bytes).




#### *ethers* . *utils* . *RLP* . **decode** ( aBytesLike )  **=>** *[DataObject](./)*

Decode an RLP-encoded *aBytesLike* into its structured Data Object.

All Data components will be returned as a [DataHexstring](../bytes).




### Data Object


A **Data Object** is a recursive structure which is used to serialize many
internal structures in Ethereum. Each **Data Object** can either be:



* Binary Data
* An Array of **Data Objects** (i.e. this recursively includes Nesting)


#### **Examples**



* `"0x1234"`
* `[ "0x1234", [ "0xdead", "0xbeef" ], [ ] ]`





-----
**Content Hash:** ebb4f7f25cb19e1ca1f2b2fa0a73140ec30365c55a2ff6b15c3637b5ef58ff06