import { version } from "../lib.esm/_version.js";

const title = "ethers";

const subtitle = (function(version) {
    const dash = version.indexOf("-");
    if (dash === -1) { return version; }
    return version.substring(dash + 1);
})(version);

export default {
  title, subtitle,

  logo: "./logo.svg",

  prefix: "v6-beta",

  srcBaseUrl: "https:/\/github.com/ethers-io/ethers.js/blob/v6-beta-exports/src.ts/{FILENAME}#L{LINENO}",

  codeRoot: "../src.ts/index.ts",
  links: [
    "./links.txt",
  ],
};
