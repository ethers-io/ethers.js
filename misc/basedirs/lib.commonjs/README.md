CommonJS Files
==============

The contents of this folder are for using `require` in CommonJS
projects.


Notes
-----

The contents are generated via the `npm run build-commonjs` target
using `tsc` and the `/tsconfig.commonjs.json` configuration.

Do not modify the files in this folder. They are deleted on `build-clean`.

To modify this `README.md`, see the `/output/post-build/lib.commonjs`.

Maintainers
-----
To exclude `lib.commmonjs` from being committed to your fork, skip all files from this folder 
from the worktree:

First go into this directory
```
cd lib.commmonjs
```
then
```
find . -maxdepth 1 -type d \( ! -name . \) -exec bash -c "cd '{}' && pwd && git ls-files -z ${pwd} | xargs -0 git update-index --skip-worktree" \;
```

https://stackoverflow.com/a/55860969/504082
