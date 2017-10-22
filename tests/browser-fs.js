'use strict';

var data = require('./dist/tests.json');

function readFileSync(filename) {
    return new Buffer(data[filename], 'base64');
}

module.exports = {
    readFileSync: readFileSync
}
