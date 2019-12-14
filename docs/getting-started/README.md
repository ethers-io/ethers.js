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
[ethers library](https://cdn.ethers.io/lib/ethers-5.0.esm.min.js) to
your own webserver and serve it yourself.

For quick demos or prototyping though, it can be loaded in your
Web Applications from our CDN.


```
<script src="https://cdn.ethers.io/lib/ethers-5.0.esm.min.js"
        type="application/javascipt"></script>
```




-----
**Content Hash:** a78889cf0b1215b8268f76e5cef5869b2b592e56a5ce062d58dfcc4f5b93159d