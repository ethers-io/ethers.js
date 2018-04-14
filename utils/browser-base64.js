'use strict';

var convert = require('./convert');

module.exports = {
    decode: function(textData) {
         textData = atob(textData);
         var data = [];
         for (var i = 0; i < textData.length; i++) {
             data.push(textData.charCodeAt(i));
         }
         return convert.arrayify(data);
    },
    encode: function(data) {
        data = convert.arrayify(data);
        var textData = '';
        for (var i = 0; i < data.length; i++) {
            textData += String.fromCharCode(data[i]);
        }
        return btoa(textData);
    }
};


