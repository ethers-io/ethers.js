'use strict';

var randomBytes = require('crypto').randomBytes;

module.exports = function(length) {
    return new Uint8Array(randomBytes(length));
}

