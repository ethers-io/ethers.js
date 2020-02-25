-----

Documentation: [html](https://docs-beta.ethers.io/)

-----

Getting Started
===============



Installing
----------


The various Classes and Functions are available to be imported
manually from sub-packages under the [@ethersproject](../Users/ricmoo/Development/ethers/ethers.js-v5/https:/www.npmjs.com/search?q=%40ethersproject%2F)
but for most projects, the umbrella package is the easiest way to
get started.


```
/home/ricmoo> npm install --save ethers@next
```



Importing
---------



### Node.js



```
// CommonJS
const { ethers } = require("ethers");

// ES6 or TypeScript 
const { ethers } = require("ethers");
```



### Web Browser


It is generally better practice (for security reasons) to copy the
[ethers library](../Users/ricmoo/Development/ethers/ethers.js-v5/https:/cdn.ethers.io/lib/ethers-5.0.esm.min.js) to your own webserver and serve it
yourself.

For quick demos or prototyping though, it can be loaded in your
Web Applications from our CDN.


```
<script src="https://cdn.ethers.io/lib/ethers-5.0.esm.min.js"
        type="application/javascipt"></script>
```




-----
**Content Hash:** 411fea94db73d596369fae807658111c05acc4906540f2790fda6dec071b4d4e