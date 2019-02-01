'use strict';

var fs = require('fs');
var through = require('through');

var gulp = require("gulp");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");

var browserify = require("browserify");
var source = require('vinyl-source-stream');
var tsify = require("tsify");

var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var buffer = require('vinyl-buffer');

function createTransform(transforms, show) {
    if (!show) { show = { }; }

    function padding(length) {
        let pad = '';
        while (pad.length < length) { pad += ' '; }
        return pad;
    }

    function transformFile(path) {
        for (var pattern in transforms) {
            if (path.match(new RegExp('/' + pattern + '$'))) {
                return transforms[pattern];
            }
        }
        return null;
    }

    return function(path, options) {
        var data = '';

        return through(function(chunk) {
            data += chunk;
        }, function () {
            var transformed = transformFile(path);
            var shortPath = path;
            if (shortPath.substring(0, __dirname.length) == __dirname) {
                shortPath = shortPath.substring(__dirname.length);
            }
            var size = fs.readFileSync(path).length;
            if (transformed != null) {
                if (show.transformed) {
                    console.log('Transformed:', shortPath, padding(70 - shortPath.length), size, padding(6 - String(size).length), '=>', transformed.length);
                }
                data = transformed;
            } else if (shortPath === '/src.ts/utils/wordlist.ts') {
                data += '\n\nexportWordlist = true;'
                if (show.transformed) {
                    console.log('Transformed:', shortPath, padding(70 - shortPath.length), size, padding(6 - String(size).length), '=>', data.length);
                }
            } else {
                if (show.preserved) {
                    console.log('Preserved:  ', shortPath, padding(70 - shortPath.length), size);
                }
            }
            this.queue(data);
            this.queue(null);
        });
    }
}

/**
 *  Bundled Library (browser)
 *
 *  Source: src.ts/index.ts src.ts/{contracts,providers,utils,wallet}/*.ts src.ts/wordlists/lang-en.ts
 *  Target: dist/ethers{.min,}.js
 */
function taskBundle(name, options) {
    var show = options.show || { };

    // The elliptic package.json is only used for its version
    var ellipticPackage = require('elliptic/package.json');
    ellipticPackage = JSON.stringify({ version: ellipticPackage.version });

    var version = require('./package.json').version;

    var undef = "module.exports = undefined;";
    var empty = "module.exports = {};";

    // This is only used in getKeyPair, which we do not use; but we'll
    // leave it in tact using the browser crypto functions
    var brorand = "module.exports = function(length) { var result = new Uint8Array(length); (global.crypto || global.msCrypto).getRandomValues(result); return result; }";

    // setImmediate is installed globally by our src.browser/shims.ts, loaded from src.ts/index.ts
    var process = "module.exports = { browser: true };";
    var timers = "module.exports = { setImmediate: global.setImmediate }; ";

    function readShim(filename) {
        return fs.readFileSync('./shims/' + filename + '.js').toString();
    }


    var transforms = {

        // Remove the precomputed secp256k1 points
        "elliptic/lib/elliptic/precomputed/secp256k1.js": undef,

        // Remove curves we don't care about
        "elliptic/curve/edwards.js": empty,
        "elliptic/curve/mont.js": empty,
        "elliptic/lib/elliptic/eddsa/.*": empty,

        // We only use the version from this JSON package
        "elliptic/package.json" : ellipticPackage,

        // Remove RIPEMD160 and unneeded hashing algorithms
        //"hash.js/lib/hash/ripemd.js": "module.exports = {ripemd160: null}",
        "hash.js/lib/hash/sha/1.js": empty,
        "hash.js/lib/hash/sha/224.js": empty,
        "hash.js/lib/hash/sha/384.js": empty,

        // Swap out borland for the random bytes we already have
        "brorand/index.js": brorand,

        "xmlhttprequest/lib/XMLHttpRequest.js": readShim("xmlhttprequest"),

        // Used by sha3 if it exists; (so make it no exist)
        "process/browser.js": process,
        "timers-browserify/main.js": timers,

        "ethers.js/utils/base64.js": readShim("base64"),
        "ethers.js/providers/ipc-provider.js": readShim("empty"),
        "ethers.js/utils/hmac.js": readShim("hmac"),
        "ethers.js/utils/pbkdf2.js": readShim("pbkdf2"),
        "ethers.js/utils/random-bytes.js": readShim("random-bytes"),
        "ethers.js/utils/shims.js": readShim("shims"),
        "ethers.js/wordlists/index.js": readShim("wordlists"),

    };

    gulp.task(name, function () {

        var result = browserify({
            basedir: '.',
            debug: false,
            entries: [ './index.js' ],
            cache: { },
            packageCache: {},
            standalone: "ethers",
            transform: [ [ createTransform(transforms, show), { global: true } ] ],
        })
        .bundle()
        .pipe(source(options.filename))

        if (options.minify) {
            result = result.pipe(buffer())
            .pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(uglify({
                output: { ascii_only: true }
            }))
            .pipe(sourcemaps.write('./'))
        }

        result = result.pipe(gulp.dest(options.dest));

        return result;
    });
}

// Creates dist/ethers.js
taskBundle("default", { filename: "ethers.js", dest: 'dist', show: { transformed: true, preserved: true }, minify: false });

// Creates dist/ethers.js
taskBundle("default-test", { filename: "ethers.js", dest: 'tests/dist', show: { transformed: true }, minify: false });

// Creates dist/ethers.min.js
taskBundle("minified", { filename: "ethers.min.js", dest: 'dist', minify: true });

// Creates dist/ethers.min.js
taskBundle("minified-test", { filename: "ethers.min.js", dest: 'tests/dist', minify: true });

gulp.task('shims', function () {

        var result = browserify({
            basedir: '.',
            debug: false,
            entries: [ './tests/shims/index.js' ],
            cache: { },
            packageCache: {},
            standalone: "_shims",
            insertGlobalVars: {
               process: function() { return; },
            }
        })
        .bundle()
        .pipe(source('shims.js'))
        .pipe(buffer())
        .pipe(uglify({
            output: { ascii_only: true }
        }))
        .pipe(gulp.dest('dist'));

        return result;
});

/*
// Dump the TypeScript definitions to dist/types/
gulp.task("types", function() {
    return gulp.src(['./src.ts/index.ts', './src.ts / * * / * . ts'])
    .pipe(ts({
        declaration: true,
        esModuleInterop: true,
        moduleResolution: "node",
        lib: [ "es2015", "es5", "dom" ],
        module: "commonjs",
        outDir: './dist/types',
        target: "es5",
    }))
    .dts
    .pipe(gulp.dest("dist/types/"))
});
*/

/**
 *  Browser Friendly BIP39 Wordlists
 *
 *  source: src.ts/wordlist/lang-*.ts
 *  target: dist/wordlist-*.js
 *
 *  Since all of the functions these wordlists use is already
 *  available from the global ethers library, we use this to
 *  target the global ethers functions directly, rather than
 *  re-include them.
 */
function taskLang(locale) {
    function transformBip39(path, options) {
        var data = '';

        return through(function(chunk) {
            data += chunk;
        }, function () {
            var shortPath = path;
            if (shortPath.substring(0, __dirname.length) == __dirname) {
                shortPath = shortPath.substring(__dirname.length);
            }

            // Word list files...
            if (shortPath.match(/^\/src\.ts\/wordlists\//)) {
                shortPath = '/';
            }

            switch (shortPath) {
                // Use the existing "ethers.errors"
                case '/src.ts/errors.ts':
                    data = "module.exports = global.ethers.errors";
                    break;

                // Use the existing "ethers.utils"
                case '/src.ts/utils/bytes.ts':
                case '/src.ts/utils/hash.ts':
                case '/src.ts/utils/properties.ts':
                case '/src.ts/utils/utf8.ts':
                    data = "module.exports = global.ethers.utils";
                    break;

                // If it is the Wordlist class, register should export the wordlist
                case '/src.ts/utils/wordlist.ts':
                    data += '\n\nexportWordlist = true;'
                    break;

                // Do nothing
                case '/':
                    break;

                default:
                    throw new Error('unhandled file: ' + shortPath);
            }

            this.queue(data);
            this.queue(null);
        });
    }

    gulp.task("bip39-" + locale, function() {
        return browserify({
            basedir: '.',
            debug: false,
            entries: [ 'src.ts/wordlists/lang-' + locale + ".ts" ],
            cache: {},
            packageCache: {},
            transform: [ [ transformBip39, { global: true } ] ],
        })
        .plugin(tsify)
        .bundle()
        .pipe(source("wordlist-" + locale + ".js"))
        .pipe(buffer())
        .pipe(uglify({
            output: { ascii_only: true }
        }))
        .pipe(gulp.dest("dist"));
    });
}

taskLang("es");
taskLang("fr");
taskLang("it");
taskLang("ja");
taskLang("ko");
taskLang("zh");

// Package up all the test cases into tests/dist/tests.json
gulp.task("tests", function() {

    function readShim(filename) {
        return fs.readFileSync('./tests/' + filename + '.js').toString();
    }

    var transforms = {
        "tests/utils-ethers.js": readShim('utils-ethers-browser')
    }

    // Create a mock-fs module that can load our gzipped test cases
    var data = {};

    fs.readdirSync('tests/tests').forEach(function(filename) {
        if (!filename.match(/\.json\.gz$/)) { return; }
        filename = 'tests/tests/' + filename;
        data['/' + filename] = fs.readFileSync(filename).toString('base64');
    });

    fs.readdirSync('tests/tests/easyseed-bip39').forEach(function(filename) {
        if (!filename.match(/\.json$/)) { return; }
        filename = 'tests/tests/easyseed-bip39/' + filename;
        data['/' + filename] = fs.readFileSync(filename).toString('base64');
    });

    fs.readdirSync('tests/wordlist-generation').forEach(function(filename) {
        if (!filename.match(/\.txt$/)) { return; }
        filename = 'tests/wordlist-generation/' + filename;
        data['/' + filename] = fs.readFileSync(filename).toString('base64');
    });

    fs.writeFileSync('./tests/dist/tests.json', JSON.stringify(data));

    return browserify({
        basedir: './',
        debug: false,
        entries: [ "./tests/browser.js" ],
        cache: {},
        packageCache: {},
        standalone: "tests",
        transform: [ [ createTransform(transforms), { global: true } ] ],
    })
    .bundle()
    .pipe(source("tests.js"))
    .pipe(gulp.dest("tests/dist/"));
});


