-----

Documentation: [html](https://docs-beta.ethers.io/)

-----


Getting Started
===============



Installing
----------


The various Classes and Functions are available to be imported
manually from sub-packages under the
[@ethersproject](https://www.npmjs.com/search?q=%40ethersproject%2F)
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
[ethers library](https://cdn.ethers.io/lib/ethers-5.0.min.js) to
your own webserver and serve it yourself.

For quick demos or prototyping though, it can be loaded in your
Web Applications from our CDN.


```
<script src="https://cdn.ethers.io/lib/ethers-5.0.min.js"
        type="application/javascipt"></script>
```




-----
**Content Hash:** 01b739e7d4410ec57652b8058ae7a5902107ce0b170ecd3550cbc97f4d287fd8