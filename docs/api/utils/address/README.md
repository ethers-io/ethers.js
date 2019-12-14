-----

Documentation: [html](https://docs-beta.ethers.io/)

-----


Addresses
=========


Explain addresses,formats and checksumming here.

Also see: [constants.AddressZero](../constants)


### Functions



#### *utils* . **getAddress** ( address )  **=>** *string*

Returns *address* as a Checksum Address.

If *address* is an invalid 40-nibble [Hexstring](../bytes) or if it contains mixed case and
the checksum is invalid, an InvalidArgument Error is throw.

The value of *address* may be any supported address format.




#### *utils* . **isAddress** ( address )  **=>** *boolean*

Returns true if *address* is valid (in any supported format).




#### *utils* . **getIcapAddress** ( address )  **=>** *string*

Returns *address* as an ICAP address. Supports the same restrictions as
[utils.getAddress](./).




#### *utils* . **getContractAddress** ( transaction )  **=>** *string*

Returns the contract address that would result if *transaction* was
used to deploy a contract.





-----
**Content Hash:** 2dd561245955594d7080796077503064181258304572112d320139ae2594f383