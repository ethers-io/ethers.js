import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import path from 'path';

const output = ({ format }) => {
  let extension = format === 'esm'
    ? '.mjs'
    : '.js';

  return {
    chunkFileNames: '[hash]' + extension,
    entryFileNames: '[name]' + extension,
    dir: './dist',
    // TODO: when approved
    // dir: format === 'esm' ? './lib.esm' : './lib',
    exports: 'named',
    externalLiveBindings: false,
    sourcemap: true,
    esModule: false,
    indent: false,
    freeze: false,
    strict: false,
    format,
    plugins: [
      terser({
        warnings: true,
        ecma: 5,
        keep_fnames: true,
        ie8: false,
        compress: {
          pure_getters: true,
          toplevel: true,
          booleans_as_integers: false,
          keep_fnames: true,
          keep_fargs: true,
          if_return: false,
          ie8: false,
          sequences: false,
          loops: false,
          conditionals: false,
          join_vars: false
        },
        mangle: {
          module: true,
          keep_fnames: true,
        },
        output: {
          beautify: true,
          braces: true,
          indent_level: 2
        }
      })
    ]
  };
};

export default {
  input: './src.ts/index.ts',
  onwarn() {},
  external: id => id.includes('@ethersproject'),
  plugins: [
    resolve({
      extensions: ['.ts'],
      mainFields: ['module', 'jsnext', 'main'],
      preferBuiltins: false,
      browser: true
    }),
    commonjs({
      ignoreGlobal: true,
      include: /\/node_modules\//,
    }),
    typescript({
      useTsconfigDeclarationDir: true,
      tsconfigOverride: {
        exclude: [
          'src/**/*.test.ts',
          'src/**/*.test.tsx',
          'src/**/test-utils/*'
        ],
        compilerOptions: {
          sourceMap: true,
          noEmit: false,
          declaration: true,
          declarationDir: path.resolve(process.cwd(), 'dist/types/'),
        },
      },
    })
  ],
  output: [
    output({ format: 'cjs' }),
    output({ format: 'esm' }),
  ].filter(Boolean),
  treeshake: {
    unknownGlobalSideEffects: false,
    tryCatchDeoptimization: false,
    moduleSideEffects: false
  }
};