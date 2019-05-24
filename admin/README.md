Admin Tool
==========

This tool is meant for admin tasks related to ethers.js.


Workflow
--------

After a new series of changes have been made and tested:

1. Run `npm run update-versions` to update and build all packages
2. Make any human-necessary changes to the automatically updated `CHANGELOG.md`
3. Run `git add .`
4. Run `git commit -S -m "Updated dist files."`
5. Run `git push`
6. Wait for TravisCI to complete running test cases
7. Run `npm run publish-all` to publish changed packages to NPM and tag GitHub


Update Dependency Graph: admin/cmds/update-depgraph
---------------------------------------------------

This is run as part of `npm run bootstrap` before running lerna bootstrap.
It recomputes the dependency graph and writes out the ordered
**tsconfig.project.json**


Update Versions: admin/cmds/update-versions
-------------------------------------------

Run using the `npm run update-versions`, which also cleans, bootstraps  and
rebuilds the project before running the script.

For each package that has changed from the version in NPM (the published
tarballs are compared):

- Update the `version` in the **package.json**
- Update the `src.ts/_version.ts` (matches the **package.json**)
- Updates the `tarballHash` in the **package.json**
- Compiles the TypeScript (which updates the `_version.js` and `_version.d.js`)
- Lists all changed files (highlighting src.ts files)

Then:

- Generate the distribution files
- Update the `CHANGELOG.md`


Publish: admin/cmds/publish
---------------------------

Run using `npm run publish-all`. This requires a password for the secure
local config and the OTP for NPM.

- Publish (in dependency order) changed files to NPM
- The `gitHead` is updated in **only** the NPM **package.json**
- @TODO: Cut a release on GitHub including the relevant CHANGELOG entry

