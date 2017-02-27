
function pbkdf2(password, salt, iterations, keylen, createHmac) {
    var hLen
    var l = 1
    var DK = new Uint8Array(keylen)
    var block1 = new Uint8Array(salt.length + 4)
    block1.set(salt);
    //salt.copy(block1, 0, 0, salt.length)

    var r
    var T

    for (var i = 1; i <= l; i++) {
        //block1.writeUInt32BE(i, salt.length)
        block1[salt.length] = (i >> 24) & 0xff;
        block1[salt.length + 1] = (i >> 16) & 0xff;
        block1[salt.length + 2] = (i >> 8) & 0xff;
        block1[salt.length + 3] = i & 0xff;

        var U = createHmac(password).update(block1).digest();

        if (!hLen) {
            hLen = U.length
            T = new Uint8Array(hLen)
            l = Math.ceil(keylen / hLen)
            r = keylen - (l - 1) * hLen
        }

        //U.copy(T, 0, 0, hLen)
        T.set(U);


        for (var j = 1; j < iterations; j++) {
            U = createHmac(password).update(U).digest()
            for (var k = 0; k < hLen; k++) T[k] ^= U[k]
        }


        var destPos = (i - 1) * hLen
        var len = (i === l ? r : hLen)
        //T.copy(DK, destPos, 0, len)
        DK.set(T.slice(0, len), destPos);

    }

    return DK
}

/*
var hmac = require('./hmac.js');
var utf8 = require('./utf8.js');
var p = require('pbkdf2');

var pw = utf8.toUtf8Bytes('password');
var sa = utf8.toUtf8Bytes('salt');

var t0 = (new Date()).getTime();
for (var i = 0; i < 100; i++) {
    pbkdf2(pw, sa, 1000, 40, hmac.createSha512Hmac);
}
var t1 = (new Date()).getTime();
for (var i = 0; i < 100; i++) {
    p.pbkdf2Sync('password', 'salt', 1000, 40, 'sha512');
}
var t2 = (new Date()).getTime();

console.log('TT', t1 - t0, t2 - t1);
*/
module.exports = pbkdf2;
