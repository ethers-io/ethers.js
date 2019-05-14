'use strict';

const fs = require('fs');
const path = require('path');
const through = require('through');

let show = { transformed: true, preserved: true };

    // The elliptic package.json is only used for its version
    var ellipticPackage = require('elliptic/package.json');
    ellipticPackage = JSON.stringify({ version: ellipticPackage.version });

    var version = require('../package.json').version;

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

//        "xmlhttprequest/lib/XMLHttpRequest.js": readShim("xmlhttprequest"),
        // Used by sha3 if it exists; (so make it no exist)
        "process/browser.js": process,
        "timers-browserify/main.js": timers,

//        "ethers.js/utils/base64.js": readShim("base64"),
//        "ethers.js/providers/ipc-provider.js": readShim("empty"),
//        "ethers.js/utils/hmac.js": readShim("hmac"),
//        "ethers.js/utils/pbkdf2.js": readShim("pbkdf2"),
//        "ethers.js/utils/random-bytes.js": readShim("random-bytes"),
//        "ethers.js/utils/shims.js": readShim("shims"),
//        "ethers.js/wordlists/index.js": readShim("wordlists"),

    };

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

const dirname = path.resolve(__dirname, '../../..');
module.exports = function(pathname, options) {
    let data = '';
    return through(function(chunk) {
        data += chunk;
    }, function () {
            var contents = fs.readFileSync(pathname).toString();
            /*
            [ 'Buffer' ].forEach((word) => {
                if (contents.indexOf(word) !== -1) {
                    console.log("Found Bad Word:", word, "in", pathname)
                }
            });
            */
            var transformed = transformFile(pathname);
            var shortPath = pathname;
            if (shortPath.substring(0, dirname.length) == dirname) {
                shortPath = shortPath.substring(dirname.length);
            }
            var size = fs.readFileSync(pathname).length;
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
            }        this.queue(data);

        this.queue(null);
    });
}
