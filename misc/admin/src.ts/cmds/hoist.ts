
import { dirs, getDependencies, isEthers, updateJson } from "../path";

(async function() {
    const deps = getDependencies();

    const dependencies = Object.keys(deps).reduce((accum, name) => {
        if (!isEthers(name)) {
            accum[name] = deps[name];
        }
        return accum;
    }, <{ [ name: string ]: string }>{ });

    updateJson(dirs.rootPackageJsonPath, { dependencies });
})();
