'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var bytes_1 = require("../utils/bytes");
module.exports = {
    decode: function (textData) {
        textData = atob(textData);
        var data = [];
        for (var i = 0; i < textData.length; i++) {
            data.push(textData.charCodeAt(i));
        }
        return bytes_1.arrayify(data);
    },
    encode: function (data) {
        data = bytes_1.arrayify(data);
        var textData = '';
        for (var i = 0; i < data.length; i++) {
            textData += String.fromCharCode(data[i]);
        }
        return btoa(textData);
    }
};
