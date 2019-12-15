The Ethers Project
==================

**EXPERIMENTAL**

This branch is the next release of ethers.js, which should
be promoted to the official release shortly.

I would recommend it for most new projects and personally use
it for my own projects.

The [new documentation](https://docs-beta.ethers.io) is still a
bit sparse, but is coming along as well and will be complete
before the promotion to master.


Installing
----------

**node.js**

```
/home/ricmoo/some_project> npm install --save ethers@next
```

**browser (UMD)**

```
<script src="https://cdn.ethers.io/lib/ethers-5.0.umd.min.js" type="text/javasctipt">
</script>
```

**browser (ESM)**

```
<script type="module">
    import { ethers } from "https://cdn.ethers.io/lib/ethers-5.0.umd.min.js";
</script>
```


Ancillary Packages
------------------

These are a number of packages not included in the umbrella `ethers ` npm package, and
additional packages are always being added. Often these packages are for specific
use-cases, so rather than adding them to the umbrella package, they are added as
ancillary packaged, which can be included by those who need them, while not bloating
everyone else with packages they do not need.

We will keep a list of useful pacakges here.

- `@ethersproject/experimental`
- `@ethersproject/cli`
- `@ethersproject/ens`
- `@ethersproject/ledger`
- `@ethersproject/trezor`


Hacking
-------

This project uses a combination of Lerna and the ./admin scripts to manage
itself as a package of packages.

The umbrella package can be found in `packages/ethers`, and all packages in general
can be found in the `packages/` folder.

If you add new dependencies to any package (incuding internal dependencies), you will
need to re-create the internal links and re-build teh dependency graph::

```
/home/ethers> npm run bootstrap
```

To run a continuous build (with incremental TypeScript compilation):

```
/home/ethers> npm run auto-build
```

Finally, once you have made all your changes, you will need to bump the version
of packages that changed their NPM tarballs, as well as update the _version.*
and distribution builds (which is what we host on the CDN for browser-based
apps). To do this, run:


```
/home/ethers> npm run update-versions
```

Which will also list all packages that have changed along with the specifc files.


License
-------

MIT License (including **all** dependencies).

