import { config } from "../config";
import { getPassword } from "../log";

if (process.argv.length !== 3) {
    console.log("Usage: set-config KEY");
    process.exit(1);
}

const key = process.argv[2];

(async function() {
    const value = await getPassword("Value: ");
    await config.set(key, value);
})().catch((error) => {
    console.log(`Error running ${ process.argv[0] }: ${ error.message }`);
    process.exit(1);
});

