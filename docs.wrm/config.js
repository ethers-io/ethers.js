import * as ethers from "../lib.esm/index.js";
import { version } from "../lib.esm/_version.js";

import { getModifiedTime } from "../lib.esm/_admin/utils/git.js";

const title = "ethers";

const subtitle = (function(version) {
    const dash = version.indexOf("-");
    if (dash === -1) { return version; }
    return version.substring(dash + 1);
})(version);

export default {
  title, subtitle,

  prefix: "v6-beta",

  contextify: function(context) {
      Object.assign(context, ethers);
      context.provider = new ethers.InfuraProvider();
      //context.getAddress = ethers.getAddress;
      context.Uint8Array = Uint8Array;
  },

  srcBaseUrl: "https:/\/github.com/ethers-io/ethers.js/blob/v6-beta-exports/src.ts/{FILENAME}#L{LINENO}",
  getTimestamp: function(path) {
      return getModifiedTime(path);
  },

  docRoot: ".",

  codeRoot: "../src.ts/index.ts",
  links: [
    "./links/javascript.txt",
    "./links/npm.txt",
    "./links/projects.txt",
    "./links/ricmoo.txt",
    "./links/specs.txt",
    "./links/wiki.txt"
  ],
  staticFiles: [
    "logo.svg",
    "social.jpg"
  ]
};
