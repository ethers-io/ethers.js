-----

Documentation: [html](https://docs.ethers.io/)

-----

React Native (and ilk)
======================

Installing
----------

```
/home/ricmoo/my-react-project> npm install @ethersproject/shims --save
```

```
// Pull in the shims (BEFORE importing ethers)
import "@ethersproject/shims"

// Import the ethers library
import { ethers } from "ethers";
```

Security
--------

```
// Import the crypto getRandomValues shim (**BEFORE** the shims)
import "react-native-get-random-values"

// Import the the ethers shims (**BEFORE** ethers)
import "@ethersproject/shims"

// Import the ethers library
import { ethers } from "ethers";
```

