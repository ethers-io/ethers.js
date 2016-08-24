'use strict';

var aes = require('aes-js');
var pbkdf2 = require('pbkdf2');
var scrypt = require('scrypt-js');
var uuid = require('uuid');

var Randomish = require('./randomish.js');
var SigningKey = require('./signing-key.js');
var utils = require('./utils.js')


// Search an Object and its children recursively, caselessly.
function searchPath(object, path) {
    var currentChild = object;

    var comps = path.toLowerCase().split('/');
    for (var i = 0; i < comps.length; i++) {

        // Search for a child object with a case-insensitive matching key
        var matchingChild = null;
        for (var key in currentChild) {
             if (key.toLowerCase() === comps[i]) {
                 matchingChild = currentChild[key];
                 break;
             }
        }

        // Didn't find one. :'(
        if (matchingChild === null) {
            return null;
        }

        // Now check this child...
        currentChild = matchingChild;
    }

    return currentChild;
}

/*
function SecretStorage(json, signingKey) {
    if (!(this instanceof SecretStorage)) { throw new Error('missing new'); }

    utils.defineProperty(this, 'json', json);

    Object.defineProperty(this, 'data', {
        enumerable: true,
        get: function() { return JSON.parse(json); }
    });

    utils.defineProperty(this, 'address', signingKey.privateKey);
    utils.defineProperty(this, 'signingKey', signingKey);
}
*/
var secretStorage = {};


utils.defineProperty(secretStorage, 'isCrowdsaleWallet', function(json) {
    try {
        var data = JSON.parse(json);
    } catch (error) { return false; }

    return (data.encseed && data.ethaddr);
});

utils.defineProperty(secretStorage, 'isValidWallet', function(json) {
    try {
        var data = JSON.parse(json);
    } catch (error) { return false; }

    if (!data.version || parseInt(data.version) !== data.version || parseInt(data.version) !== 3) {
        return false;
    }
    // @TODO: Put more checks to make sure it has kdf, iv and all that good stuff
    return true;
});


// See: https://github.com/ethereum/pyethsaletool
utils.defineProperty(secretStorage, 'decryptCrowdsale', function(json, password) {
    var data = JSON.parse(json);

    // Ethereum Address
    var ethaddr = utils.getAddress(searchPath(data, 'ethaddr'));

    // Encrypted Seed
    var encseed = new Buffer(searchPath(data, 'encseed'), 'hex');
    if (!encseed || (encseed.length % 16) !== 0) {
        throw new Error('invalid encseed');
    }

    var key = pbkdf2.pbkdf2Sync(password, password, 2000, 32, 'sha256').slice(0, 16);

    var iv = encseed.slice(0, 16);
    var encryptedSeed = encseed.slice(16);

    // Decrypt the seed
    var seed = new Buffer(0);
    var aesCbc = new aes.ModeOfOperation.cbc(key, iv);
    for (var i = 0; i < encryptedSeed.length; i += 16) {
        seed = Buffer.concat([seed, new Buffer(aesCbc.decrypt(encryptedSeed.slice(i, i + 16)))]);
    }

    // Check PKCS#7 padding is valid
    var pad = seed[seed.length - 1];
    if (pad > 16 || pad > seed.length) {
        throw new Error('invalid password');
    }
    for (var i = seed.length - pad; i < seed.length; i++) {
        if (seed[i] !== pad) {
            throw new Error('invalid password');
        }
    }

    // Strip the padding
    seed = seed.slice(0, seed.length - pad);

    // This wallet format is weird... Convert the binary encoded hex to a string.
    var seedHex = '';
    for (var i = 0; i < seed.length; i++) {
        seedHex += String.fromCharCode(seed[i]);
    }

    var signingKey = new SigningKey(utils.sha3(new Buffer(seedHex)));

    if (signingKey.address !== ethaddr) {
        throw new Error('corrupt crowdsale wallet');
    }

    return signingKey;
});


utils.defineProperty(secretStorage, 'decrypt', function(json, password, progressCallback) {
    if (!Buffer.isBuffer(password)) { throw new Error('password must be a buffer'); }

    var data = JSON.parse(json);

    var decrypt = function(key, ciphertext) {
        var cipher = searchPath(data, 'crypto/cipher');
        if (cipher === 'aes-128-ctr') {
            var iv = new Buffer(searchPath(data, 'crypto/cipherparams/iv'), 'hex')
            var counter = new aes.Counter(iv);

            var aesCtr = new aes.ModeOfOperation.ctr(key, counter);

            return new Buffer(aesCtr.decrypt(ciphertext));
        }

        return null;
    };

    var computeMAC = function(derivedHalf, ciphertext) {
        return utils.sha3(Buffer.concat([derivedHalf, ciphertext]));
    }

    return new Promise(function(resolve, reject) {
        var kdf = searchPath(data, 'crypto/kdf');
        if (kdf && kdf.toLowerCase() === 'scrypt') {
            var salt = new Buffer(searchPath(data, 'crypto/kdfparams/salt'), 'hex');
            var N = parseInt(searchPath(data, 'crypto/kdfparams/n'));
            var r = parseInt(searchPath(data, 'crypto/kdfparams/r'));
            var p = parseInt(searchPath(data, 'crypto/kdfparams/p'));
            if (!N || !r || !p) {
                reject(new Error('unsupported key-derivation function parameters'));
                return;
            }

            // Make sure N is a power of 2
            if ((N & (N - 1)) !== 0) {
                reject(new Error('unsupported key-derivation function parameter value for N'));
                return;
            }

            var dkLen = searchPath(data, 'crypto/kdfparams/dklen');
            if (dkLen !== 32) {
                reject( new Error('unsupported key-derivation derived-key length'));
                return;
            }

            scrypt(password, salt, N, r, p, dkLen, function(error, progress, key) {
                if (error) {
                    error.progress = progress;
                    reject(error);

                } else if (key) {
                    key = new Buffer(key);

                    var ciphertext = new Buffer(searchPath(data, 'crypto/ciphertext'), 'hex');

                    var computedMAC = computeMAC(key.slice(16, 32), ciphertext).toString('hex').toLowerCase();
                    if (computedMAC !== searchPath(data, 'crypto/mac').toLowerCase()) {
                        reject(new Error('invalid password'));
                        return;
                    }

                    var privateKey = decrypt(key.slice(0, 16), ciphertext);

                    if (!privateKey) {
                        reject(new Error('unsupported cipher'));
                        return;
                    }

                    var signingKey = new SigningKey(privateKey);
                    if (signingKey.address !== utils.getAddress(data.address)) {
                        reject(new Error('address mismatch'));
                        return;
                    }

                    if (progressCallback) { progressCallback(1); }
                    resolve(signingKey);

                } else if (progressCallback) {
                    return progressCallback(progress);
                }
            });

        } else {
            // @TOOD: Support pbkdf2 kdf
            reject(new Error('unsupported key-derivation function'));
        }

    });
});

utils.defineProperty(secretStorage, 'encrypt', function(privateKey, password, options, progressCallback) {

    // the options are optional, so adjust the call as needed
    if (typeof(options) === 'function' && !progressCallback) {
        progressCallback = options;
        options = {};
    }
    if (!options) { options = {}; }

    // Check the private key
    if (privateKey instanceof SigningKey) {
        privateKey = privateKey.privateKey;
    }
    privateKey = utils.hexOrBuffer(privateKey, 'private key');
    if (privateKey.length !== 32) { throw new Erro('invalid private key'); }

    // Check the password
    if (!Buffer.isBuffer(password)) { throw new Error('password must be a buffer'); }

    // Check/generate the salt
    var salt = options.salt;
    if (salt) {
        salt = utils.hexOrBuffer(salt, 'salt');
    } else {
        salt = (new Randomish()).randomBytes(32);;
    }

    // Override initialization vector
    var iv = null;
    if (options.iv) {
        iv = utils.hexOrBuffer(options.iv, 'iv');
        if (iv.length !== 16) { throw new Error('invalid iv'); }
    }

    // Override the uuid
    var uuidRandom = options.uuid;
    if (uuidRandom) {
        uuidRandom = utils.hexOrBuffer(uuidRandom, 'uuid');
        if (uuidRandom.length !== 16) { throw new Error('invalid uuid'); }
    }

    // Override the scrypt password-based key derivation function parameters
    var N = (1 << 17), r = 8, p = 1;
    if (options.scrypt) {
        if (options.scrypt.N) { N = options.scrypt.N; }
        if (options.scrypt.r) { r = options.scrypt.r; }
        if (options.scrypt.p) { p = options.scrypt.p; }
    }

    return new Promise(function(resolve, reject) {

        // We take 64 bytes:
        //   - 32 bytes   As normal for the Web3 secret storage (derivedKey, macPrefix)
        //   - 16 bytes   The initialization vector
        //   - 16 bytes   The UUID random bytes
        scrypt(password, salt, N, r, p, 64, function(error, progress, key) {
            if (error) {
                error.progress = progress;
                reject(error);

            } else if (key) {
                // Convert the array-like to a Buffer
                key = new Buffer(key);

                // These will be used to encrypt the wallet (as per Web3 secret storage)
                var derivedKey = key.slice(0, 16);
                var macPrefix = key.slice(16, 32);

                // Get the initialization vector
                if (!iv) { iv = key.slice(32, 48); }

                // Get the UUID random data
                if (!uuidRandom) { uuidRandom = key.slice(48, 64); }

                // Get the address for this private key
                var address = (new SigningKey(privateKey)).address;

                // Encrypt the private key
                var counter = new aes.Counter(iv);
                var aesCtr = new aes.ModeOfOperation.ctr(derivedKey, counter);
                var ciphertext = new Buffer(aesCtr.encrypt(privateKey));

                // Compute the message authentication code, used to check the password
                var mac = utils.sha3(Buffer.concat([macPrefix, ciphertext]))

                // See: https://github.com/ethereum/wiki/wiki/Web3-Secret-Storage-Definition
                var data = {
                    address: address,
                    id: uuid.v4({random: uuidRandom}),
                    version: 3,
                    Crypto: {
                        cipher: 'aes-128-ctr',
                        cipherparams: {
                            iv: iv.toString('hex')
                        },
                        ciphertext: ciphertext.toString('hex'),
                        kdf: 'scrypt',
                        kdfparams: {
                            salt: salt.toString('hex'),
                            n: N,
                            dklen: 32,
                            p: p,
                            r: r
                        },
                        mac: mac.toString('hex')
                    }
                };

                if (progressCallback) { progressCallback(1); }
                resolve(JSON.stringify(data));

            } else if (progressCallback) {
                return progressCallback(progress);
            }
        });
    });
});

module.exports = secretStorage;
