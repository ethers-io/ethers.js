import { setupBuild } from "../build";
import { colorify } from "../log";
import { getPackageJsonPath } from "../path";
import { loadJson, saveJson } from "../utils";

(async function() {
    process.argv.slice(2).forEach((arg) => {
        console.log(colorify.bold("Setting Option:"), arg);
        switch(arg) {
            case "esm":
                setupBuild(true);
                break;

            case "cjs":
                setupBuild(false);
                break;

            // This will remove the browser field entirely, so make sure
            // to set esm of cjs first as they will restore the browser
            // field
            case "browser-lang-all": {
                const filename = getPackageJsonPath("wordlists");
                const info = loadJson(filename);
                delete info.browser;
                saveJson(filename, info, true);
                break;
            }

            default:
                throw new Error(`Unknown option: ${ JSON.stringify(arg) }`);
      }
    });
})().catch((error) => {
    console.log(`Error running ${ process.argv[0] }: ${ error.message }`);
    process.exit(1);
});
