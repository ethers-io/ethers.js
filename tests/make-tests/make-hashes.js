'use strict';

var crypto = require('crypto');
var createKeccakHash = require('keccak');

var utils = require('../utils');

var output = [];

function add(data) {
    output.push({
        data: ('0x' + data.toString('hex')),
        keccak256: '0x' + createKeccakHash('keccak256').update(data).digest().toString('hex'),
        sha256: '0x' + crypto.createHash('sha256').update(data).digest().toString('hex'),
        sha512: '0x' + crypto.createHash('sha512').update(data).digest().toString('hex'),
    });
}

add(Buffer.from([ ]));
add(Buffer.from([ 0 ]));
add(Buffer.from([ 1 ]));
add(Buffer.from([ 0, 1 ]));

for (var i = 0; i < 512; i++) {
    var data = Buffer.from(utils.randomBytes('data-' + i, 1, 128));
    add(data);
}

utils.saveTests('hashes', output);
