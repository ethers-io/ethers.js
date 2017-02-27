'use strict';

var hash = require('hash.js');

var sha2 = require('./sha2.js');

var convert = require('./convert.js');

// @TODO: Make this use create-hmac in node

function createSha256Hmac(key) {
    if (!key.buffer) { key = convert.arrayify(key); }
    return new hash.hmac(sha2.createSha256, key);
}

function createSha512Hmac(key) {
    if (!key.buffer) { key = convert.arrayify(key); }
    return new hash.hmac(sha2.createSha512, key);
}

module.exports = {
    createSha256Hmac: createSha256Hmac,
    createSha512Hmac: createSha512Hmac,
};
