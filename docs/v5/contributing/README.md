-----

Documentation: [html](https://docs.ethers.io/)

-----

Contributing and Hacking
========================

Building
--------

```
# Clone the repository
/home/ricmoo> git clone git@github.com:ethers-io/ethers.js.git
/home/ricmoo> cd ethers.js

# Install the base dependencies
/home/ricmoo/ethers.js> npm install

# Install each module's dependencies and link the libraries
# internally, so they reference each other
/home/ricmoo/ethers.js> npm run bootstrap
```

Making your changes
-------------------

```
# Begin watching the files and re-building whenever they change
/home/ricmoo/ethers.js> npm run auto-build


# Sometimes the issue only affects the ESM modules
/home/ricmoo/ethers.js> npm run auto-build-esm


# Or if you only need to run a single build
/home/ricmoo/ethers.js> npm run _build-cjs
/home/ricmoo/ethers.js> npm run _build-esm
```

```
# Rebuilds all files and bundles testcases up for testing
/home/ricmoo/ethers.js> npm test

# Often you don't need the full CI experience
/home/ricmoo/ethers.js> npm run _test-node
```

```
/home/ricmoo/ethers.js> npm run update-version
```

Documentation
-------------

### Building

```
/home/ricmoo/ethers.js> npm run build-docs
```

### Evaluation

```
/home/ricmoo/ethers.js> npm run build-docs -- --skip-eval
```

### Previewing Changes

```
/home/ricmoo/ethers.js> npm run serve-docs
```

