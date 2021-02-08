-----

Documentation: [html](https://docs.ethers.io/)

-----

Contributing and Hacking
========================

Building
--------

```
# Clone the repository
/home/ricmoo> git clone https://github.com/ethers-io/ethers.js.git

/home/ricmoo> cd ethers.js

# Install all dependencies:
# - Hoists all sub-package dependencies in the package.json (preinstall)
# - Installs all the (hoisted) dependencies and devDependencies (install)
# - Build the rat-nests (in .package_node_modules) (postinstall)
# - Create a dependency graph for the TypeScript (postinstall)
# - Link the rat-nets into each project (postinstall)
/home/ricmoo/ethers.js> npm install
```

### Making Changes

```
# Begin watching the files and re-building whenever they change
/home/ricmoo/ethers.js> npm run auto-build

# Or if you do not want to watch and just build
/home/ricmoo/ethers.js> npm run build
```

### Creating Browser-Ready Files

```
# If you need to rebuild all the libs (esm + cjs) and dist files
# Note: this requires node 10 or newer
/home/ricmoo/ethers.js> npm run build-all
```

### Testing

```
# Rebuilds all files (npm run build-all) and bundles testcases up for testing
/home/ricmoo/ethers.js> npm test

# Often you don't need the full CI experience
/home/ricmoo/ethers.js> npm run test-node
```

### Distribution

```
# Prepare all the distribution files
# - Remove all generated files (i.e. npm run clean)
# - Re-install all dependencies, hoisting, etc. (npm install)
# - Spell check all strings in every TypeScript files
# - Build everything from scratch with this clean install
# - Compare local with npm, bumping the version if changed
# - Build everything again (with the updated versions)
# - Update the CHANGELOG.md with the git history since the last change
/home/ricmoo/ethers.js> npm run update-version
```

#### Do NOT check in dist files in a PR

For Pull Requests, please ONLY commit files in the `docs.wrm/` and `packages/*/src.ts/` folders. I will prepare the distribution builds myself and keeping the PR relevant makes it easier to verify the changes.


### Publishing

```
# Publish
# - Update any changed packages to NPM
# - Create a release on GitHub with the latest CHANGELOG.md description
# - Upload the bundled files the the CDN
# - Flush the CDN edge caches
/home/ricmoo/ethers.js> npm run publish-all
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

