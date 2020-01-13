const { setupBuild } = require("../build");
const { loadPackage, savePackage } = require("../local");

const arg = process.argv[2];

(async function() {
    switch(arg) {
        case "esm":
            setupBuild(true);
            break;

        case "cjs":
            setupBuild(false);
            break;

        case "browser-lang-en": {
            const info = loadPackage("wordlists");
            if (info._browser) {
                info.browser = info._browser;
                delete info._browser;
                savePackage("wordlists", info);
            }
            break;
        }

        case "browser-lang-all": {
            const info = loadPackage("wordlists");
            if (info.browser) {
                info._browser = info.browser;
                delete info.browser;
                savePackage("wordlists", info);
            }
            break;
        }

        default:
            console.log("unknown option");
            return 1;
    }
    return 0;

})().then((result) => {
    process.exit(result);
});
