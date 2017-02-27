'use strict';

var aes = require('aes-js');
var scrypt = require('scrypt-js');
var uuid = require('uuid');

var utils = require('ethers-utils');

var SigningKey = require('./signing-key.js');

function arrayify(hexString) {
    if (typeof(hexString) === 'string' && hexString.substring(0, 2) !== '0x') {
        hexString = '0x' + hexString;
    }
    return utils.arrayify(hexString);
}

function getPassword(password) {
    if (typeof(password) === 'string') {
        return utils.toUtf8Bytes(password, 'NFKC');
    }
    return utils.arrayify(password, 'password');
}

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

    password = getPassword(password);

    // Ethereum Address
    var ethaddr = utils.getAddress(searchPath(data, 'ethaddr'));

    // Encrypted Seed
    var encseed = arrayify(searchPath(data, 'encseed'));
    if (!encseed || (encseed.length % 16) !== 0) {
        throw new Error('invalid encseed');
    }

    var key = utils.pbkdf2(password, password, 2000, 32, utils.hmac.createSha256Hmac).slice(0, 16);

    var iv = encseed.slice(0, 16);
    var encryptedSeed = encseed.slice(16);

    // Decrypt the seed
    var aesCbc = new aes.ModeOfOperation.cbc(key, iv);
    var seed = utils.arrayify(aesCbc.decrypt(encryptedSeed));
    seed = aes.padding.pkcs7.strip(seed);

    // This wallet format is weird... Convert the binary encoded hex to a string.
    var seedHex = '';
    for (var i = 0; i < seed.length; i++) {
        seedHex += String.fromCharCode(seed[i]);
    }

    var seedHexBytes = utils.toUtf8Bytes(seedHex);

    var signingKey = new SigningKey(utils.keccak256(seedHexBytes));

    if (signingKey.address !== ethaddr) {
        throw new Error('corrupt crowdsale wallet');
    }

    return signingKey;
});


utils.defineProperty(secretStorage, 'decrypt', function(json, password, progressCallback) {
    var data = JSON.parse(json);

    password = getPassword(password);

    var decrypt = function(key, ciphertext) {
        var cipher = searchPath(data, 'crypto/cipher');
        if (cipher === 'aes-128-ctr') {
            var iv = arrayify(searchPath(data, 'crypto/cipherparams/iv'), 'crypto/cipherparams/iv')
            var counter = new aes.Counter(iv);

            var aesCtr = new aes.ModeOfOperation.ctr(key, counter);

            return new arrayify(aesCtr.decrypt(ciphertext));
        }

        return null;
    };

    var computeMAC = function(derivedHalf, ciphertext) {
        return utils.keccak256(utils.concat([derivedHalf, ciphertext]));
    }

    return new Promise(function(resolve, reject) {
        var kdf = searchPath(data, 'crypto/kdf');
        if (kdf && typeof(kdf) === 'string' && kdf.toLowerCase() === 'scrypt') {
            var salt = arrayify(searchPath(data, 'crypto/kdfparams/salt'), 'crypto/kdfparams/salt');
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

            var dkLen = parseInt(searchPath(data, 'crypto/kdfparams/dklen'));
            if (dkLen !== 32) {
                reject( new Error('unsupported key-derivation derived-key length'));
                return;
            }

            scrypt(password, salt, N, r, p, dkLen, function(error, progress, key) {
                if (error) {
                    error.progress = progress;
                    reject(error);

                } else if (key) {
                    key = arrayify(key);

                    var ciphertext = arrayify(searchPath(data, 'crypto/ciphertext'));

                    var computedMAC = utils.hexlify(computeMAC(key.slice(16, 32), ciphertext)).substring(2);
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
    privateKey = utils.arrayify(privateKey, 'private key');
    if (privateKey.length !== 32) { throw new Erro('invalid private key'); }

    password = getPassword(password);

    // Check/generate the salt
    var salt = options.salt;
    if (salt) {
        salt = arrayify(salt, 'salt');
    } else {
        salt = utils.randomBytes(32);;
    }

    // Override initialization vector
    var iv = null;
    if (options.iv) {
        iv = arrayify(options.iv, 'iv');
        if (iv.length !== 16) { throw new Error('invalid iv'); }
    }

    // Override the uuid
    var uuidRandom = options.uuid;
    if (uuidRandom) {
        uuidRandom = utils.arrayify(uuidRandom, 'uuid');
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
                key = arrayify(key);

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
                var ciphertext = utils.arrayify(aesCtr.encrypt(privateKey));

                // Compute the message authentication code, used to check the password
                var mac = utils.keccak256(utils.concat([macPrefix, ciphertext]))

                // See: https://github.com/ethereum/wiki/wiki/Web3-Secret-Storage-Definition
                var data = {
                    address: address.substring(2).toLowerCase(),
                    id: uuid.v4({random: uuidRandom}),
                    version: 3,
                    Crypto: {
                        cipher: 'aes-128-ctr',
                        cipherparams: {
                            iv: utils.hexlify(iv).substring(2),
                        },
                        ciphertext: utils.hexlify(ciphertext).substring(2),
                        kdf: 'scrypt',
                        kdfparams: {
                            salt: utils.hexlify(salt).substring(2),
                            n: N,
                            dklen: 32,
                            p: p,
                            r: r
                        },
                        mac: mac.substring(2)
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
