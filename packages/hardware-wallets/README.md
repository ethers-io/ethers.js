Hardware Wallets
================

Thid is still very experimental.

I only have 1 ledger nano, and testing is done locally (CirlceCI doesn't have
ledgers plugged in ;)).

API
===

```
import { LedgerSigner } from "@ethersproject/hardware-wallets";
const signer = new LedgerSigner(provider, type, path);
// By default:
//   - in node, type = "hid"
//   - path is the default Ethereum path (i.e.  `m/44'/60'/0'/0/0`)
```

License
=======

All ethers code is MIT License.

Each hardware wallet manufacturer may impose additional license
requirements so please check the related abstraction libraries
they provide.

All Firefly abstraction is also MIT Licensed.
