
var through = require('through');

var undef = "module.exports = undefined;";
var empty = "module.exports = {};";

var transforms = {
    "ripemd.js": "module.exports = {ripemd160: null}",
    "precomputed/secp256k1.js": undef,
    "elliptic/curve/edwards.js": empty,
    "elliptic/curve/mont.js": empty,
    "elliptic/lib/elliptic/eddsa/.*": empty,
    "elliptic/lib/elliptic/eddsa/.*": empty,
    "elliptic/lib/elliptic/hmac-drbg.js": empty,
//    "elliptic/package.json" :

    "base64-js/.*": undef,
    "browser-resolve:.*": undef,
    "buffer/.*": undef,
    "buffer-shims/.*": undef,
    "cipher-base/.*": undef,
    "core-util-is/.*": undef,
    "create-hash/.*": undef,
    "create-hmac/.*": undef,
    "events/.*": undef,
    "hmac-drbg/lib/hmac-drbg.js": undef,
    "ieee754/.*": undef,
    "isarray/.*": undef,
    "pbkdf2/.*": undef,
    "process/.*": undef,
    "readable-stream/.*": undef,
    "sha.js/.*": undef,
    "stream-browserify/.*": undef,
    "string_decoder/.*": undef,
};

var modified = {};
var unmodified = {};

function transformFile(path) {
    for (var pattern in transforms) {
        if (path.match(new RegExp(pattern + '$'))) {
            modified[pattern] = true;
            return transforms[pattern];
        }
    }
    return null;
}

function transform(path, options) {
    var data = '';

    return through(function(chunk) {
        data += chunk;
    }, function () {
        var transformed = transformFile(path);
        if (transformed != null) {
            //console.log('Transform: ' + path + ' => ' + transformed);
            data = transformed;
        } else {
            unmodified[path] = true;
            //console.log('Not transformed:', path);
        }
        //console.log(data.length, 'FOOBAR', path);
        this.queue(data);
        this.queue(null);
    });
}

function checkBundle(error, source, next) {
    var passed = Object.keys(unmodified);
    passed.sort();
    console.log('Unmodified:');
    passed.forEach(function(path) {
        console.log('  ' + path);
    });
    /*
    var skipped = Object.keys(transforms);
    Object.keys(modified).forEach(function(key) {
        delete skipped[key];
    });
    skipped.sort();
    if (skipped.length) {
        console.log('Unused Patterns:');
        skipped.forEach(function(pattern) {
            console.log('  ' + pattern);
        });
    }
    */
    next(error, source);
}

module.exports = function(grunt) {
  grunt.initConfig({
    browserify: {
      dist: {
        files: {
            'dist/ethers.js': './index.js',
            'dist/ethers-contracts.js': './contracts/index.js',
            'dist/ethers-hdnode.js': './hdnode/index.js',
            'dist/ethers-providers.js': './providers/index.js',
            'dist/ethers-utils.js': './utils/index.js',
            'dist/ethers-wallet.js': './wallet/index.js',
            'dist/ethers-tests.js': './tests/browser.js',
        },
        options: {
          transform: [
              [ transform, { global: true } ],
          ],
          browserifyOptions: {
            standalone: 'ethers',
          },
          postBundleCB: checkBundle
        },
      },
    },
    uglify: {
      dist: {
        files: {
          'dist/ethers.min.js' : [ './dist/ethers.js' ],
          'dist/ethers-contracts.min.js' : [ './dist/ethers-contracts.js' ],
          'dist/ethers-hdnode.min.js' : [ './dist/ethers-hdnode.js' ],
          'dist/ethers-providers.min.js' : [ './dist/ethers-providers.js' ],
          'dist/ethers-utils.min.js' : [ './dist/ethers-utils.js' ],
          'dist/ethers-wallet.min.js' : [ './dist/ethers-wallet.js' ],
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('dist', ['browserify', 'uglify']);
};
