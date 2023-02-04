import { inspect } from "util";

import * as ethers from "../lib.esm/index.js";
import { version } from "../lib.esm/_version.js";

import { getModifiedTime } from "../lib.esm/_admin/utils/git.js";

const title = "ethers";

const subtitle = (function(version) {
    const dash = version.indexOf("-");
    if (dash === -1) { return version; }
    return version.substring(dash + 1);
})(version);

const extraLinks = function() {
    return [
      `link-cdnjs [ethers.min.js](https:/\/cdnjs.cloudflare.com/ajax/libs/ethers/${ version }/ethers.min.js)`,
      `link-cdnjs-wordlists [wordlists-extra.min.js](https:/\/cdnjs.cloudflare.com/ajax/libs/ethers/${ version }/wordlists-extra.min.js)`,
    ];
}

export default {
  title, subtitle,

  // Where all the basic documentation is
  docRoot: ".",

  // Where all the code is for the jsdocs API crawler
  codeRoot: "../src.ts/index.ts",

  // Place all files in the /v6/ folder
  prefix: "v6",

  // Prepare the context for running the examples
  contextify: function(context) {
    Object.assign(context, ethers);
    context.provider = new ethers.InfuraProvider();
    context.Uint8Array = Uint8Array;

    ethers.InfuraProvider.prototype[inspect.custom] = function(depth, options, inspect) {
      if (depth > 0) { return `InfuraProvider { ... }`; }
      // Does this cause infinite recursion??
      return this;
    };

    ethers.Interface.prototype[inspect.custom] = function(depth, options, inspect) {
      if (depth > 0) { return `Interface { ... }`; }
      // Does this cause infinite recursion??
      return this;
    };

    ethers.Fragment.prototype[inspect.custom] = function(depth, options, inspect) {
      if (depth > 0) { return `${ this.constructor.name } { ... }`; }
      // Does this cause infinite recursion??
      return this;
    };
  },

  // The base URL to use for the <src> links
  srcBaseUrl: "https:/\/github.com/ethers-io/ethers.js/blob/main/src.ts/{FILENAME}#L{LINENO}",

  // Used at the bottom of each page to indicate the last-modified-time.
  // This uses the most recent time in the repo that the file was
  // updated.
  getTimestamp: function(path) {
      return getModifiedTime(path);
  },

  // All the links to pull in
  links: [
    "./links/javascript.txt",
    "./links/npm.txt",
    "./links/projects.txt",
    "./links/ricmoo.txt",
    "./links/specs.txt",
    "./links/wiki.txt",
    extraLinks
  ],

  // Extra files to copy over to the /static folder
  staticFiles: [
    "logo.svg",
    "social.jpg"
  ]
};
