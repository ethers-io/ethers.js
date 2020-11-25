import { config } from "../config";

if (process.argv.length !== 3) {
    console.log("Usage: get-config KEY");
    process.exit(1);
}

const key = process.argv[2];

(async function() {
    const value = await config.get(key);
    console.log(value);
})().catch((error) => {
    console.log(`Error running ${ process.argv[0] }: ${ error.message }`);
    process.exit(1);
});
