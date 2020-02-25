-----

Documentation: [html](https://docs-beta.ethers.io/)

-----

Addresses
=========


Explain addresses,formats and checksumming here.

Also see: [constants.AddressZero](../constants)


Address Formats
---------------



### Address


An **Address** is a [DataHexstring](../bytes) of 20 bytes (40 nibbles), with optional
mixed case.

If the case is mixed, it is a **Checksum Address**, which uses a specific pattern
of uppercase and lowercase letters within a given address to reduce the risk
of errors introduced from typing an address or cut and paste issues.

All functions that return an Address will return a Checksum Address.


### ICAP Address


The **ICAP Address Format** was an early attempt to introduce a checksum
into Ethereum addresses using the popular banking industry's
[IBAN](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/en.wikipedia.org/wiki/International_Bank_Account_Number)
format with the country code specified as **XE**.

Due to the way IBAN encodes address, only addresses that fit into 30 base-36
characters are actually compatible, so the format was adapted to support 31
base-36 characters which is large enough for a full Ethereum address, however
the preferred method was to select a private key whose address has a `0` as
the first byte, which allows the address to be formatted as a fully compatibly
standard IBAN address with 30 base-36 characters.

In general this format is no longer widely supported anymore, however any function that
accepts an address can receive an ICAP address, and it will be converted internally.

To convert an address into the ICAP format, see [getIcapAddress](./).


Functions
---------



#### *ethers* . *utils* . **getAddress** ( address )  **=>** *string< [Address](./) >*

Returns *address* as a Checksum Address.

If *address* is an invalid 40-nibble [Hexstring](../bytes) or if it contains mixed case and
the checksum is invalid, an InvalidArgument Error is throw.

The value of *address* may be any supported address format.




#### *ethers* . *utils* . **isAddress** ( address )  **=>** *boolean*

Returns true if *address* is valid (in any supported format).




#### *ethers* . *utils* . **getIcapAddress** ( address )  **=>** *string< [IcapAddress](./) >*

Returns *address* as an [ICAP address](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/github.com/ethereum/wiki/wiki/Inter-exchange-Client-Address-Protocol-%28ICAP%29).
Supports the same restrictions as [utils.getAddress](./).




#### *ethers* . *utils* . **getContractAddress** ( transaction )  **=>** *string< [Address](./) >*

Returns the contract address that would result if *transaction* was
used to deploy a contract.




#### *ethers* . *utils* . **getCreate2Address** ( from , salt , initCodeHash )  **=>** *string< [Address](./) >*

Returns the contract address that would result from the given
[CREATE2](../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/eips.ethereum.org/EIPS/eip-1014) call.





-----
**Content Hash:** 94de1affabe23203e5796f6ad2bd7ccacfb9dd51e5ea7db004c10cd2aea8fded