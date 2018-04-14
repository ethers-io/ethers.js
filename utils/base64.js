'use strict';

var convert = require('./convert');

module.exports = {
    decode: function(textData) {
        return convert.arrayify(new Buffer(textData, 'base64'));
    },

    encode: function(data) {
        return (new Buffer(convert.arrayify(data))).toString('base64');
    }
};
