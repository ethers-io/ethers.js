'use strict';

var hash = require('hash.js');

var convert = require('./convert.js');

// @TODO: Make this use create-hmac in node

function createSha256Hmac(key) {
    if (!key.buffer) { key = convert.arrayify(key); }
    return new hash.hmac(hash.sha256, key);
}

function createSha512Hmac(key) {
    if (!key.buffer) { key = convert.arrayify(key); }
    return new hash.hmac(hash.sha512, key);
}

module.exports = {
    createSha256Hmac: createSha256Hmac,
    createSha512Hmac: createSha512Hmac,
};
