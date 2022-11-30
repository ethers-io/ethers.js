"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const index_js_1 = require("../index.js");
describe("Tests UTF-8 bad strings", function () {
    const tests = [
        {
            name: "unexpected continue",
            bytes: new Uint8Array([0x41, 0x80, 0x42, 0x43]),
            ignore: "ABC",
            replace: "A\ufffdBC",
            error: "UNEXPECTED_CONTINUE"
        },
        {
            name: "bad prefix",
            bytes: new Uint8Array([0x41, 0xf8, 0x42, 0x43]),
            ignore: "ABC",
            replace: "A\ufffdBC",
            error: "BAD_PREFIX"
        },
        {
            name: "bad prefix (multiple)",
            bytes: new Uint8Array([0x41, 0xf8, 0x88, 0x88, 0x42, 0x43]),
            ignore: "ABC",
            replace: "A\ufffdBC",
            error: "BAD_PREFIX"
        },
        {
            name: "OVERRUN",
            bytes: new Uint8Array([0x41, 0x42, 0xe2, 0x82 /* 0xac */]),
            ignore: "AB",
            replace: "AB\ufffd",
            error: "OVERRUN"
        },
        {
            name: "missing continue",
            bytes: new Uint8Array([0x41, 0x42, 0xe2, 0xe2, 0x82, 0xac, 0x43]),
            ignore: "AB\u20acC",
            replace: "AB\ufffd\u20acC",
            error: "MISSING_CONTINUE"
        },
        {
            name: "out-of-range",
            bytes: new Uint8Array([0x41, 0x42, 0xf7, 0xbf, 0xbf, 0xbf, 0x43]),
            ignore: "ABC",
            replace: "AB\ufffdC",
            error: "OUT_OF_RANGE"
        },
        {
            name: "UTF-16 surrogate (low)",
            bytes: new Uint8Array([0x41, 0x42, 0xed, 0xa0, 0x80, 0x43]),
            ignore: "ABC",
            replace: "AB\ufffdC",
            error: "UTF16_SURROGATE"
        },
        {
            name: "UTF-16 surrogate (high)",
            bytes: new Uint8Array([0x41, 0x42, 0xed, 0xbf, 0xbf, 0x43]),
            ignore: "ABC",
            replace: "AB\ufffdC",
            error: "UTF16_SURROGATE"
        },
        {
            name: "overlong",
            bytes: new Uint8Array([0xf0, 0x82, 0x82, 0xac]),
            ignore: "",
            replace: "\u20ac",
            error: "OVERLONG"
        }
    ];
    for (const { name, bytes, ignore, replace, error } of tests) {
        it(`correctly handles ${name}: replace strategy`, function () {
            const result = (0, index_js_1.toUtf8String)(bytes, index_js_1.Utf8ErrorFuncs.replace);
            assert_1.default.equal(result, replace);
        });
        it(`correctly handles ${name}: ignore strategy`, function () {
            const result = (0, index_js_1.toUtf8String)(bytes, index_js_1.Utf8ErrorFuncs.ignore);
            assert_1.default.equal(result, ignore);
        });
        it(`correctly handles ${name}: error strategy`, function () {
            assert_1.default.throws(() => {
                const result = (0, index_js_1.toUtf8String)(bytes);
                console.log(result);
            }, (e) => {
                return (e.message.indexOf(error) >= 0);
            });
        });
    }
    it("correctly fails to get UTF-8 bytes from incomplete surrogate", function () {
        assert_1.default.throws(() => {
            const text = String.fromCharCode(0xd800);
            ;
            const result = (0, index_js_1.toUtf8Bytes)(text);
            console.log(result);
        }, (error) => {
            return (error.message.startsWith("invalid surrogate pair"));
        });
    });
    it("correctly fails to get UTF-8 bytes from invalid surrogate pair", function () {
        assert_1.default.throws(() => {
            const text = String.fromCharCode(0xd800, 0xdbff);
            ;
            const result = (0, index_js_1.toUtf8Bytes)(text);
            console.log(result);
        }, (error) => {
            return (error.message.startsWith("invalid surrogate pair"));
        });
    });
});
describe("Tests UTF-8 bad strings", function () {
    const tests = [
        {
            name: "the Euro symbol",
            text: "AB\u20acC",
            codepoints: [0x41, 0x42, 0x20ac, 0x43]
        },
    ];
    for (const { name, text, codepoints } of tests) {
        it(`expands strings to codepoints: ${name}`, function () {
            const result = (0, index_js_1.toUtf8CodePoints)(text);
            assert_1.default.equal(result.length, codepoints.length, "codepoints.length");
            for (let i = 0; i < result.length; i++) {
                assert_1.default.equal(result[i], codepoints[i], `codepoints[${i}]`);
            }
        });
    }
});
//# sourceMappingURL=test-utils-utf8.js.map