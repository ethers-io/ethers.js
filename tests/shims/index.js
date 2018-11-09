'use strict';

// Shim String.prototype.normalize
try {
    // Some platforms have a native normalize, but it is broken; so we force our shim
    if (String.fromCharCode(0xe9).normalize('NFD') !== String.fromCharCode(0x65, 0x0301)) {
        throw new Error('bad normalize');
    }
} catch (error) {
    var unorm = require('./unorm.js');
    console.log("Broken String.prototype.normalize... Forcing shim.");
    String.prototype.normalize = function(form) {
        var func = unorm[(form || 'NFC').toLowerCase()];
        if (!func) { throw new RangeError('invalid form - ' + form); }
        return func(this);
    }
}

// Shim atob and btoa
var base64 = require('./base64.js');
if (!global.atob) { global.atob = base64.atob; }
if (!global.btoa) { global.btoa = base64.btoa; }

// Shim Promise
var promise = require('./es6-promise.auto.js');

// Shim ArrayBuffer.isView
if (!ArrayBuffer.isView) {
    ArrayBuffer.isView = function(obj) {
        // @TODO: This should probably check various instanceof aswell
        return !!(obj.buffer);
    }
}

// Shim nextTick
if (!global.nextTick) {
    global.nextTick = function (callback) { setTimeout(callback, 0); }
}

