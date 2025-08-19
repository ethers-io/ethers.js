ESM Files
=========

The contents of this folder are for using `import` in ESM
projects.


Notes
-----

The contents are generated via the `npm run build` target
using `tsc` and the `/tsconfig.esm.json` configuration.

Do not modify the files in this folder. They are deleted on `build-clean`.

To modify this `README.md`, see the `/output/post-build/lib.esm`.


Maintainers
-----
To exclude `lib.esm` from being committed to your fork, skip all files from this folder 
from the worktree:

First go into this directory
```
cd lib.esm
```
then
```
find . -maxdepth 1 -type d \( ! -name . \) -exec bash -c "cd '{}' && pwd && git ls-files -z ${pwd} | xargs -0 git update-index --skip-worktree" \;
```

https://stackoverflow.com/a/55860969/504082
