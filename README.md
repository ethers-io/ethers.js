The Ethers Project
==================

**EXPERIMENTAL!!!**

This is just a development version to experiment with lerna.

**Do NOT use**


Installing
----------

**node.js**

```
/home/ricmoo/some_project> npm install --save ethers
```

**browser**

```
<script src="@TODO" type="text/javasctipt">
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
/home/ethers> npm run update-version
```

Which will also list all packages that have changed along with the specifc files.


License
-------

MIT License (including **all** dependencies).

