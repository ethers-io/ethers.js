import { dirnames, getPackageJsonPath, resolve } from "./path";
import { loadJson, saveJson } from "./utils";

function setupConfig(outDir: string, moduleType: string, targetType: string) {

    // Configure the tsconfit.package.json...
    const path = resolve("tsconfig.package.json");
    const content = loadJson(path);
    content.compilerOptions.module = moduleType;
    content.compilerOptions.target = targetType;
    saveJson(path, content, true);

    // Configure the browser field for every pacakge, copying the
    // browser.umd filed for UMD and browser.esm for ESM
    dirnames.forEach((dirname) => {
        const filename = getPackageJsonPath(dirname)
        const info = loadJson(filename);

        if (info._ethers_nobuild) { return; }

        let path = resolve("packages", dirname, "tsconfig.json");
        let content = loadJson(path);
        content.compilerOptions.outDir = outDir;
        saveJson(path, content, true);
    });
}

export function setupBuild(buildModule: boolean): void {
    if (buildModule) {
        setupConfig("./lib._esm/", "es2015", "es2015");
    } else {
        setupConfig("./lib/", "commonjs", "es5");
    }
}
