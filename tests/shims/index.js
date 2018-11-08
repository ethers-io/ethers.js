'use strict';

// Shim String.prototype.normalize
var unorm = require('./unorm.js');

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

