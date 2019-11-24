'use strict';

var shims = [];

// Shim String.prototype.normalize
try {
    var missing = [];

    // Some platforms are missing certain normalization forms
    var forms = ["NFD", "NFC", "NFKD", "NFKC"];
    for (var i = 0; i < forms.length; i++) {
        try {
            "test".normalize(forms[i]);
        } catch(error) {
            missing.push(forms[i]);
        }
    }

    if (missing.length) {
        shims.push("String.prototype.normalize (missing: " + missing.join(", ") + ")");
        throw new Error('bad normalize');
    }

    // Some platforms have a native normalize, but it is broken; so we force our shim
    if (String.fromCharCode(0xe9).normalize('NFD') !== String.fromCharCode(0x65, 0x0301)) {
        shims.push("String.prototype.normalize (broken)");
        throw new Error('bad normalize');
    }
} catch (error) {
    var unorm = require('./unorm.js');
    String.prototype.normalize = function(form) {
        var func = unorm[(form || 'NFC').toLowerCase()];
        if (!func) { throw new RangeError('invalid form - ' + form); }
        return func(this);
    }
}

// Shim atob and btoa
var base64 = require('./base64.js');
if (!global.atob) {
    shims.push("atob");
    global.atob = base64.atob;
}
if (!global.btoa) {
    shims.push("btoa");
    global.btoa = base64.btoa;
}

// Shim Promise
// @TODO: Check first?
var promise = require('./es6-promise.auto.js');

// Shim ArrayBuffer.isView
if (!ArrayBuffer.isView) {
    shims.push("ArrayBuffer.isView");
    ArrayBuffer.isView = function(obj) {
        // @TODO: This should probably check various instanceof aswell
        return !!(obj.buffer);
    }
}

if (Array.prototype.fill == null) {
    shims.push("Array.fill");
    Array.prototype.fill = function(value) {
        for (var i = 0; i < this.length; i++) { this[i] = value; }
    }
}

// Shim nextTick
if (!global.nextTick) {
    shims.push("nextTick");
    global.nextTick = function (callback) { setTimeout(callback, 0); }
}

if (shims.length) {
    console.log("Shims Injected:");
    for (var i = 0; i < shims.length; i++) {
        console.log('  - ' + shims[i]);
    }
}
