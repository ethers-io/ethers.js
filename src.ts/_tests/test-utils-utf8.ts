import assert from "assert";

import {
    toUtf8Bytes, toUtf8CodePoints, toUtf8String,
    Utf8ErrorFuncs
} from "../index.js";

export type TestCaseBadString = {
    name: string,
    bytes: Uint8Array,
    ignore: string,
    replace: string,
    error: string
};

export type TestCaseCodePoints = {
    name: string;
    text: string;
    codepoints: Array<number>;
};

describe("Tests UTF-8 bad strings", function() {

    const tests: Array<TestCaseBadString> = [
        {
            name: "unexpected continue",
            bytes: new Uint8Array([ 0x41,  0x80,  0x42,  0x43 ]),
            ignore: "ABC",
            replace: "A\ufffdBC",
            error: "UNEXPECTED_CONTINUE"
        },
        {
            name: "bad prefix",
            bytes: new Uint8Array([ 0x41,  0xf8,  0x42,  0x43 ]),
            ignore: "ABC",
            replace: "A\ufffdBC",
            error: "BAD_PREFIX"
        },
        {
            name: "bad prefix (multiple)",
            bytes: new Uint8Array([ 0x41,  0xf8, 0x88, 0x88, 0x42,  0x43 ]),
            ignore: "ABC",
            replace: "A\ufffdBC",
            error: "BAD_PREFIX"
        },
        {
            name: "OVERRUN",
            bytes: new Uint8Array([ 0x41,  0x42,  0xe2, 0x82 /* 0xac */ ]),
            ignore: "AB",
            replace: "AB\ufffd",
            error: "OVERRUN"
        },
        {
            name: "missing continue",
            bytes: new Uint8Array([ 0x41,  0x42,  0xe2,  0xe2, 0x82, 0xac,  0x43 ]),
            ignore: "AB\u20acC",
            replace: "AB\ufffd\u20acC",
            error: "MISSING_CONTINUE"
        },
        {
            name: "out-of-range",
            bytes: new Uint8Array([ 0x41,  0x42,  0xf7, 0xbf, 0xbf, 0xbf,  0x43 ]),
            ignore: "ABC",
            replace: "AB\ufffdC",
            error: "OUT_OF_RANGE"
        },
        {
            name: "UTF-16 surrogate (low)",
            bytes: new Uint8Array([ 0x41,  0x42,  0xed, 0xa0, 0x80,  0x43 ]),
            ignore: "ABC",
            replace: "AB\ufffdC",
            error: "UTF16_SURROGATE"
        },
        {
            name: "UTF-16 surrogate (high)",
            bytes: new Uint8Array([ 0x41,  0x42,  0xed, 0xbf, 0xbf,  0x43 ]),
            ignore: "ABC",
            replace: "AB\ufffdC",
            error: "UTF16_SURROGATE"
        },
        {
            name: "overlong",
            bytes: new Uint8Array([ 0xf0, 0x82, 0x82, 0xac ]),
            ignore: "",
            replace: "\u20ac",
            error: "OVERLONG"
        }
    ];

    for (const { name, bytes, ignore, replace, error } of tests) {
        it(`correctly handles ${ name }: replace strategy`, function() {
            const result = toUtf8String(bytes, Utf8ErrorFuncs.replace);
            assert.equal(result, replace);
        });

        it(`correctly handles ${ name }: ignore strategy`, function() {
            const result = toUtf8String(bytes, Utf8ErrorFuncs.ignore);
            assert.equal(result, ignore);
        });

        it(`correctly handles ${ name }: error strategy`, function() {
            assert.throws(() => {
                const result = toUtf8String(bytes);
                console.log(result);
            }, (e: any) => {
                return (e.message.indexOf(error) >= 0);
            });
        });
    }

    it("correctly fails to get UTF-8 bytes from incomplete surrogate", function() {
        assert.throws(() => {
            const text = String.fromCharCode(0xd800);;
            const result = toUtf8Bytes(text);
            console.log(result);
        }, (error: any) => {
            return (error.message.startsWith("invalid surrogate pair"));
        });
    });

    it("correctly fails to get UTF-8 bytes from invalid surrogate pair", function() {
        assert.throws(() => {
            const text = String.fromCharCode(0xd800, 0xdbff);;
            const result = toUtf8Bytes(text);
            console.log(result);
        }, (error: any) => {
            return (error.message.startsWith("invalid surrogate pair"));
        });
    });
});

describe("Tests UTF-8 bad strings", function() {

    const tests: Array<TestCaseCodePoints> = [
        {
            name: "the Euro symbol",
            text: "AB\u20acC",
            codepoints: [ 0x41, 0x42, 0x20ac, 0x43 ]
        },
    ];

    for (const { name, text, codepoints } of tests) {
        it(`expands strings to codepoints: ${ name }`, function() {
            const result = toUtf8CodePoints(text);
            assert.equal(result.length, codepoints.length, "codepoints.length");
            for (let i = 0; i < result.length; i++) {
                assert.equal(result[i], codepoints[i], `codepoints[${ i }]`);
            }
        });
    }

});
