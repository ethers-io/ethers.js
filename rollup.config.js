
import { nodeResolve } from '@rollup/plugin-node-resolve';

function getConfig(opts) {
  if (opts == null) { opts = { }; }

  const file = `./dist/ethers${ (opts.suffix || "") }.js`;
  const exportConditions = [ "default", "module", "import" ];
  const mainFields = [ "module", "main" ];
  if (opts.browser) { mainFields.unshift("browser"); }

  return {
    input: "./lib.esm/index.js",
    output: {
      file,
      format: "esm",
      sourcemap: true
    },
    context: "window",
    treeshake: false,
    plugins: [ nodeResolve({
        exportConditions,
        mainFields,
        modulesOnly: true,
        preferBuiltins: false
    }) ],
  };
}

export default [
  getConfig({ browser: true }),
  {
    input: "./lib.esm/wordlists/wordlists-extra.js",
    output: {
      file: "./dist/wordlists-extra.js",
      format: "esm",
      sourcemap: true
    },
    treeshake: true,
    plugins: [ nodeResolve({
      exportConditions: [ "default", "module", "import" ],
      mainFields: [ "browser", "module", "main" ],
      modulesOnly: true,
      preferBuiltins: false
    }) ],
  }
];
