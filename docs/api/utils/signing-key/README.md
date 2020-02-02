-----

Documentation: [html](https://docs-beta.ethers.io/)

-----


Signing Key
===========



#### *ethers* . *utils* . **verifyMessage** ( message , signature )  **=>** *string< [Address](../address) >*

Returns the address that signed *message* producing *signature*. The
signature may have a non-canonical v (i.e. does not need to be 27 or 28),
in which case it will be normalized to compute the `recoveryParam` which
will then be used to compute the address; this allows systems which use
the v to encode additional data (such as [EIP-155](https://eips.ethereum.org/EIPS/eip-155))
to be used since the v parameter is still completely non-ambiguous.





-----
**Content Hash:** 91ee024442e5991be731bab1bf05310b3540825acc1c1c7dffa608eff450430b