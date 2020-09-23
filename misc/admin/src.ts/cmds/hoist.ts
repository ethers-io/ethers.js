
import { dirs, isEthers } from "../path";
import { getDependencies, updateJson } from "../local";
import { colorify } from "../log";

(async function() {
    const dependencies = getDependencies(null, (name: string) => {
        return !isEthers(name);
    });

    console.log(colorify.bold(`Hoisting ${ Object.keys(dependencies).length } dependencies into root package...`));

    updateJson(dirs.rootPackageJsonPath, { dependencies });
})().catch((error) => {
    console.log(`Error running ${ process.argv[0] }: ${ error.message }`);
    process.exit(1);
});
