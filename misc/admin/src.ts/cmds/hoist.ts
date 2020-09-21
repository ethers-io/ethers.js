
import { dirs, isEthers } from "../path";
import { getDependencies, updateJson } from "../local";

(async function() {
    const dependencies = getDependencies(null, (name: string) => {
        return !isEthers(name);
    });
    updateJson(dirs.rootPackageJsonPath, { dependencies });
})().catch((error) => {
    console.log(`Error running ${ process.argv[0] }: ${ error.message }`);
    process.exit(1);
});
