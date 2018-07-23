'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
try {
    module.exports.XMLHttpRequest = XMLHttpRequest;
}
catch (error) {
    console.log('Warning: XMLHttpRequest is not defined');
    module.exports.XMLHttpRequest = null;
}
