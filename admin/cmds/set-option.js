const { setupBuild } = require("../build");
const { loadPackage, savePackage } = require("../local");

const arg = process.argv[2];

(async function() {
    process.argv.slice(2).forEach((arg) => {
        console.log("Setting Option:", arg);
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
                const info = loadPackage("wordlists");
                delete info.browser;
                savePackage("wordlists", info);
                break;
            }

            default:
                console.log("Unknown option:", arg);
                return 1;
      }
    });
    return 0;

})().then((result) => {
    process.exit(result);
});
