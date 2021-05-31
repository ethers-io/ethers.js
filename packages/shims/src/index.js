'use strict';

(function() {

    var shims = [];

    // Shim String.prototype.normalize
    try {
        var missing = [];

        // Some platforms are missing certain normalization forms
        var forms = ["NFD", "NFC", "NFKD", "NFKC"];
        for (var i = 0; i < forms.length; i++) {
            try {
                // Simple test that catches invalid normalization
                if ("test".normalize(forms[i]) !== "test") {
                    throw new Error("failed to normalize");
                }

                // @TODO: Must find a better way to detect completely
                // broken normalize implementations. On some versions
                // of Android, the following causes the entire app
                // to abort. Might want to add "check if normalizing
                // is necessary" to Wordlist; if the entire string is
                // from CJK planes, no need to call normalize?
                //
                // Some platforms seem to only fail when normalizing
                // specific code planes, so add those here as they
                // come up.
                //               "hangul"
                //const checks = [ "\ud55c\uae00" ];
                //for (var j = 0; j < checks.length; j++) {
                //    checks[j].normalize(forms[i]);
                //}
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

    // Shim ArrayBuffer.isView
    if (!ArrayBuffer.isView) {
        shims.push("ArrayBuffer.isView");
        ArrayBuffer.isView = function(obj) {
            // @TODO: This should probably check various instanceof aswell
            return !!(obj.buffer);
        }
    }

    // Shim nextTick
    if (!global.nextTick) {
        shims.push("nextTick");
        global.nextTick = function (callback) { setTimeout(callback, 0); }
    }

    // Shim crypto.getRandomValues
    // @TOOD: Investigate: https://github.com/brix/crypto-js/issues/7
    if (!global.crypto) { global.crypto = { }; }
    if (!global.crypto.getRandomValues) {
        shims.push("crypto.getRandomValues");
        console.log("WARNING: This environment is missing a secure random source; generated private keys may be at risk, think VERY carefully about not adding a better secure source.");
        global.crypto.getRandomValues = function(buffer) {
            var start = Math.floor((new Date()).getTime()) % buffer.length;
            for (var i = 0; i < buffer.length; i++) {
                buffer[(start + i) % buffer.length] = Math.floor(Math.random() * 256);
            }
        }
    }

    // Shim FileReader.readAsArrayBuffer
    // https://github.com/facebook/react-native/issues/21209
    try {
        var fr = new FileReader();
        try {
            fr.readAsArrayBuffer(new Blob([ "hello" ], { type: "text/plain" }));
        } catch (error) {
            shims.push("FileReader.prototype.readAsArrayBuffer");
            FileReader.prototype.readAsArrayBuffer = function (blob) {
                if (this.readyState === this.LOADING) { throw new Error("InvalidStateError"); }
                this._setReadyState(this.LOADING);
                this._result = null;
                this._error = null;
                var fr = new FileReader();
                fr.onloadend = () => {
                    var content = atob(fr.result.split(",").pop().trim());
                    var buffer = new ArrayBuffer(content.length);
                    var view = new Uint8Array(buffer);
                    view.set(Array.from(content).map(c => c.charCodeAt(0)));
                    this._result = buffer;
                    this._setReadyState(this.DONE);
                };
                fr.readAsDataURL(blob);
            }
        }
    } catch (error) {
        console.log("Missing FileReader; unsupported platform");
    }

    if (shims.length) {
        console.log("Shims Injected:");
        for (var i = 0; i < shims.length; i++) {
            console.log('  - ' + shims[i]);
        }
    }

})();



