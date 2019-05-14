Admin Tool
==========

This tool is meant for admin taks related to ethers.js.


Workflow
--------

After a new change is made and `npm run build` has been used to compile the
TypeScript, the following steps should be completed to publish it.

1. Run `admin status` or `admin diff` to update the package.json (tarballHash and version) and audit changes
2. Run `admin add-source` to stage changed source files
3. Run `git commit -S -m "message..."`
4. Run `npm dist` to create the changelog and all dist files
5. Update the changelog as needed
6. Run `admin add-dist` to stage the dist files
7. Run test cases
8. Run `git commit -S -m "Updated dist files."`
9. Run `git push`
10. Wait for TravisCI to complete running test cases
11. Run `admin publish` to publish changed packages to NPM and tag GitHub


Status: admin status
--------------------

- Updates all package.json `tarballHash`
- List all files that are different from the most recent published files.

Diff: admin diff
----------------

- Updates all package.json `tarballHash`
- List all diffs between the local files and the most recent published files.

Add Source: admin add-source
----------------------------

- Stages all changed files which are library source files

Add Dist: admin add-dist
------------------------

- Stages all changed files which are dist files


Update Dependency Graph: admin/cmds/update-depgraph
---------------------------------------------------

This is run as part of `npm run bootstrap` before running lerna bootstrap.
It recomputes the dependency graph and writes out the ordered
**tsconfig.project.json**


Update Versions: admin/cmds/update-versions
-------------------------------------------

Run using the `npm run update-versions`, which also cleans, bootstraps  and
rebuilds the project.

For each package that has changed from the version in NPM (the published
tarballs are compared):

- Update the `version` in the **package.json**
- Update the **src.ts/_version.js** (matches the **package.json**)
- Updates the `tarballHash` in the **package.json**
- Compiles the TypeScript (which updates the **_version.js** and **_version.d.js**)
- Lists all changed files


Publish: admin/cmds/publish
----------------------------

Run using `node admin/cmds/publish`.

- Publish (in dependency order) changed files to NPM
- The `gitHead` is updated in **only** the NPM **package.json**

