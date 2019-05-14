Experimental Playground
=======================

This package is a collection of quick little ideas, which may be half-baked.

If you find a particular feature piques your interest, please feel free to open
an issue on GitHub to discuss it.

Also, if you have any system that requires an object from this package, make sure
you specify the **exact npm version** in your package.json, as backwards compatibility
is **NOT** guaranteed for this pacakge; APIs may change and classes may disappear.


Items
-----

**BrainWallet**

In general, a Brain Wallet is not recommended, but it is a fature we offered in v3
and below. It allows a wallet to be described and recovered using a username and a
password. However, anyone who can guess a username and password can steal the funds,
and the password cannot be changed. But for backwards compatibility and for simple
testing, we provide it here.

```javascript
import { BrainWallet } from "@ethersproject/experimenatl/brain-wallet";

// This is optional, but since a Brain Wallet can take 5-10s to generate,
// helps keep your users informed
function showProgress(percent) {
    if (percent === 1) {
        console.log("Done.");
    } else {
        console.log("Completed: " + Math.trunc(100 * percent) + "%");
    }
}

// Generate a legacy-compatible Brain Wallet
BrainWallet.generateLegacy(username, password, showProgress).then((wallet) => {
    console.log(wallet);
});

// Generate a new-style Brain Wallet, which contains a Mnemonic Phrase too
BrainWallet.generate(username, password, showProgess).then((wallet) => {
    console.log(wallet);
});
```

**NonceManager**

```javascript
import { NonceManager } from "@ethersproject/experimenatl/nonce-manager";

let signer = "... any way you get a signer ...";

// The NonceManager Signer will automatically manage the nonce for you
// so you may blast the network with as many transactions as you would
// like. Transactions which have not been mined within XXX timeout and
// will be rebroadcast; keep in mind that unmined transactions remain
// in memory.
let managedSigner = new NonceManager(signer);
```

**RetryProvider**

```javascript
import { RetryProvider } from "@ethersproject/experimenatl/retry-provider";

let provider = "... any way you get a signer...";

// All options are optional
let options = {
}

let retryProivder = new RetryProvider(provider, options);
```


License
-------

MIT License.
