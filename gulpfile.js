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


/////////////////////////
// Transforms


// The elliptic package.json is only used for its version
var ellipticPackage = require('elliptic/package.json');
ellipticPackage = JSON.stringify({ version: ellipticPackage.version });

var version = require('./package.json').version;

var undef = "module.exports = undefined;";
var empty = "module.exports = {};";

// We already have a random Uint8Array browser/node safe source
// @TODO: Use path construction instead of ../..
var brorand = "var randomBytes = require('../../src.ts/utils').randomBytes; module.exports = function(length) { return randomBytes(length); };";

// setImmediate is installed globally by our src.browser/shims.ts, loaded from src.ts/index.ts
var process = "module.exports = { };";
var timers = "module.exports = { setImmediate: global.setImmediate }; ";

var transforms = {
//    'ethers.js/package.json': JSON.stringify({ version: version }),

    // Remove the precomputed secp256k1 points
    "elliptic/lib/elliptic/precomputed/secp256k1.js": undef,

    // Remove curves we don't care about
    "elliptic/curve/edwards.js": empty,
    "elliptic/curve/mont.js": empty,
    "elliptic/lib/elliptic/eddsa/.*": empty,

    // We only use the version from this JSON package
    "elliptic/package.json" : ellipticPackage,

    // Remove RIPEMD160
    "hash.js/lib/hash/ripemd.js": "module.exports = {ripemd160: null}",
    "hash.js/lib/hash/sha/1.js": empty,
    "hash.js/lib/hash/sha/224.js": empty,
    "hash.js/lib/hash/sha/384.js": empty,

    // Swap out borland for the random bytes we already have
    "brorand/index.js": brorand,

    // Used by sha3 if it exists; (so make it no exist)
//    "process/.*": undef,
    "process/browser.js": process,
    "timers-browserify/main.js": timers,
};

function transformFile(path) {
    for (var pattern in transforms) {
        if (path.match(new RegExp('/' + pattern + '$'))) {
            return transforms[pattern];
        }
    }
    return null;
}

function padding(length) {
    let pad = '';
    while (pad.length < length) { pad += ' '; }
    return pad;
}

/**
 *  Browser Library
 *
 *  Source: src.ts/index.ts src.ts/{contracts,providers,utils,wallet}/*.ts
 *  Target: dist/ethers{.min,}.js
 *
 *  See the above transform tables which maps regular expressions to
 *  replacement source for largely libraries we only require parts of.
 *
 */
function transform(path, options) {
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
            console.log('Transformed:', shortPath, padding(70 - shortPath.length), size, padding(6 - String(size).length), '=>', transformed.length);
            data = transformed;
        } else if (shortPath === '/src.ts/wordlists/wordlist.ts') {
            data += '\n\nexportWordlist = true;'
        } else {
            console.log('Preserved:  ', shortPath, padding(70 - shortPath.length), size);
        }
        this.queue(data);
        this.queue(null);
    });
}

/**
 *  Browser Wordlist files
 *
 *  Source: src.ts/wordlists/lang-*.ts.
 *  Target: dist/wordlist-*.js
 *
 *  Since all of the functions these wordlists use is already
 *  available from the global ethers library, we use this to
 *  target the global ethers functions directly, rather than
 *  re-include them.
 *
 */
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
            // If it is the wordlist class, register should export the wordlist
            if (shortPath === '/src.ts/wordlists/wordlist.ts') {
                data += '\n\nexportWordlist = true;'
            }
            shortPath = '/';
        }

        switch (shortPath) {
            case '/src.ts/utils/errors.ts':
                data = "module.exports = global.ethers.utils.errors";
                break;
            case '/src.ts/utils/bytes.ts':
            case '/src.ts/utils/properties.ts':
            case '/src.ts/utils/utf8.ts':
                data = "module.exports = global.ethers.utils";
                break;
            case '/': break;
            default:
                throw new Error('unhandled file: ' + shortPath);
        }

        this.queue(data);
        this.queue(null);
    });
}


function taskBundle(name, options) {

  gulp.task(name, function () {

    var result = browserify({
        basedir: '.',
        debug: false,
        entries: [ 'src.ts/' ],
        cache: {},
        packageCache: {},
        standalone: "ethers",
        transform: [ [ transform, { global: true } ] ],
    })
    .plugin(tsify)
    .bundle()
    .pipe(source(options.filename))

    if (options.minify) {
        result = result.pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
    }

    result = result.pipe(gulp.dest("dist"));

    return result;
  });
}

// Creates dist/ethers.js
taskBundle("default", { filename: "ethers.js", minify: false });

// Creates dist/ethers.min.js
taskBundle("minified", { filename: "ethers.min.js", minify: true });

// Crearte a single definition file and its map as dist/ethers.d.ts[.map]
gulp.task("types", function() {
    return gulp.src(['./src.ts/index.ts', './src.ts/**/*.ts'])
    .pipe(ts({
        declaration: true,
        esModuleInterop: true,
        moduleResolution: "node",
        outFile: 'ethers.js',
        lib: [ "es2015", "es5", "dom" ],
        module: "amd",
        target: "es5"
    }))
    .dts
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest("dist"))
});

/**
 *  Browser Friendly BIP39 Wordlists
 *
 *  source: src.ts/wordlist/lang-*.ts
 *  target: dist/wordlist-*.js
 *
 */
function taskLang(locale) {
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
        .pipe(uglify())
        .pipe(gulp.dest("dist"));
    });
}

taskLang("it");
taskLang("ja");
taskLang("ko");
taskLang("zh");

// Package up all the test cases into tests/dist/tests.json
gulp.task("tests", function() {

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

    fs.writeFileSync('./tests/dist/tests.json', JSON.stringify(data));

    return browserify({
        basedir: './',
        debug: false,
        entries: [ "./tests/browser.js" ],
        cache: {},
        packageCache: {},
        standalone: "tests"
    })
    .bundle()
    .pipe(source("tests.js"))
    .pipe(gulp.dest("tests/dist/"));
});


