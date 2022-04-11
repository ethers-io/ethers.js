import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from "@rollup/plugin-replace";
import { terser } from "rollup-plugin-terser";


function getDistConfig({ suffix, format, minify }) {
  if (suffix == null) { suffix = ""; }
  if (format == null) { format = "es"; }
  if (minify == null) { minify = false; }


  const replacements = {
    preventAssignment: false,
    delimiters: [ '', '' ],
    values: {
      // sepc256k1; kill the require
      "import nodeCrypto from 'crypto';": "const nodeCrypto = undefined; /* ethers:rollup */",

      // Get our browser-friendly versions in here
      '"crypto"; /*-browser*/': '"./crypto-browser.js";',
      '"./base64.js"; /*-browser*/': '"./base64-browser.js";',
      '"./get-url.js"; /*-browser*/': '"./get-url-browser.js";',
      '"./provider-ipcsocket.js"; /*-browser*/': '"./provider-ipcsocket-browser.js";',
      '"ws"; /*-browser*/': '"./ws-browser.js";',

      // Default dist builds only include English
      '"./wordlists.js"': '"./wordlists-en.js"'
    }
  };

  const plugins = [
    replace(replacements),
    nodeResolve({ }),
  ];

  if (minify) { plugins.push(terser()); }

  return {
    input: "./packages/ethers/lib/index.js",
    output: [
      {
        file: `./packages/ethers/dist/ethers${ suffix }.js`,
        format,
        name: ((format === "umd") ? "ethers": undefined),
        sourcemap: true
      },
    ],
    context: "window",
    plugins
  }
};

function getExtraWordlistConfig() {
  return {
    input: "./packages/wordlists/lib/wordlists-extra.js",
    output: [
      {
        file: 'packages/ethers/dist/ethers-wordlists.min.js',
        format: 'es'
      },
    ],
    context: "window",
    plugins: [ terser() ]
  }
}

export default [
  getDistConfig({ minify: false }),
  getDistConfig({ suffix: ".min", minify: true }),
  getDistConfig({ suffix: ".umd.min", format: "umd", minify: true }),
  getExtraWordlistConfig(),
];
