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

add(new Buffer([ ]));
add(new Buffer([ 0 ]));
add(new Buffer([ 1 ]));
add(new Buffer([ 0, 1 ]));

for (var i = 0; i < 512; i++) {
    var data = new Buffer(utils.randomBytes('data-' + i, 1, 128));
    add(data);
}

utils.saveTests('hashes', output);
