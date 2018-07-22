'use strict';

import { arrayify } from '../utils/bytes';

module.exports = {
    decode: function(textData: string): Uint8Array {
         textData = atob(textData);
         var data = [];
         for (var i = 0; i < textData.length; i++) {
             data.push(textData.charCodeAt(i));
         }
         return arrayify(data);
    },
    encode: function(data: Uint8Array): string {
        data = arrayify(data);
        var textData = '';
        for (var i = 0; i < data.length; i++) {
            textData += String.fromCharCode(data[i]);
        }
        return btoa(textData);
    }
};


