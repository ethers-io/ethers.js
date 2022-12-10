import assert from "assert";

import {
    isError,
    getBigInt, getNumber, toBeArray, toBeHex, toQuantity,
} from "../index.js";

describe("Tests Quantity Functions", function() {
    const quantities: Array<{ name: string, value: any, expected: string }> = [
        {
            name: "zero number",
            value: 0,
            expected: "0x0"
        },
        {
            name: "zero single hex",
            value: "0x0",
            expected: "0x0"
        },
        {
            name: "zero double hex",
            value: "0x00",
            expected: "0x0"
        },
        {
            name: "zero array(0)",
            value: new Uint8Array([ ]),
            expected: "0x0"
        },
        {
            name: "zero array(1)",
            value: new Uint8Array([ 0 ]),
            expected: "0x0"
        },
        {
            name: "single hex digit",
            value: 0x5,
            expected: "0x5"
        },
        {
            name: "double hex digit",
            value: 0x42,
            expected: "0x42"
        },
        {
            name: "big array, odd output",
            value: new Uint8Array([ 0x0f, 254, 253, 252 ]),
            expected: "0xffefdfc"
        },
        {
            name: "big array, even output",
            value: new Uint8Array([ 255, 254, 253, 252 ]),
            expected: "0xfffefdfc"
        },
    ];

    for (const { name, value, expected } of quantities) {
        it(`computes quantity: ${ name }`, function() {
            assert.equal(toQuantity(value), expected);
        });
    }
});

describe("Tests Bad Math Values", function() {
    const badBigInts: Array<{ name: string, value: any, error: string }> = [
        {
            name: "empty string",
            value: "",
            error: "invalid BigNumberish string"
        },
        {
            name: "non-numeric string",
            value: "foobar",
            error: "invalid BigNumberish string"
        },
        {
            name: "double negative sign",
            value: "--42",
            error: "invalid BigNumberish string"
        },
        {
            name: "non-numeric thing",
            value: true,
            error: "invalid BigNumberish value"
        },
    ];

    for (const { name, value, error } of badBigInts) {
        it(`correctly fails on bad bigint: ${ name }`, function() {
            assert.throws(() => {
                const result = getBigInt(value);
                console.log(result);
            }, (e: any) => {
                return (isError(e, "INVALID_ARGUMENT") &&
                    e.message.startsWith(error));
            });
        });
    }

    const badNumbers: Array<{ name: string, value: any, error: string }> = [
        {
            name: "empty string",
            value: "",
            error: "invalid numeric string"
        },
        {
            name: "non-numeric string",
            value: "foobar",
            error: "invalid numeric string"
        },
        {
            name: "double negative sign",
            value: "--42",
            error: "invalid numeric string"
        },
        {
            name: "non-numeric thing",
            value: true,
            error: "invalid numeric value"
        },
        {
            name: "too big",
            value: Number.MAX_SAFE_INTEGER + 10,
            error: "overflow"
        },
        {
            name: "too small",
            value: -Number.MAX_SAFE_INTEGER - 10,
            error: "overflow"
        },
    ];

    for (const { name, value, error } of badNumbers) {
        it(`correctly fails on bad numeric: ${ name }`, function() {
            assert.throws(() => {
                const result = getNumber(value);
                console.log(result);
            }, (e: any) => {
                return (isError(e, "INVALID_ARGUMENT") &&
                    e.message.startsWith(error));
            });
        });
    }

    const badHex: Array<{ name: string, value: any, error: string, width?: number }> = [
        {
            name: "negative value",
            value: -4,
            error: "unsigned value cannot be negative"
        },
        {
            name: "width too short",
            value: 0x123456,
            width: 2,
            error: "value exceeds width"
        },
    ];

    for (const { name, value, error, width } of badHex) {
        it(`correctly fails on bad toBeHex values: ${ name }`, function() {
            assert.throws(() => {
                const result = toBeHex(value, width);
                console.log(result);
            }, (e: any) => {
                return (isError(e, "NUMERIC_FAULT") && e.fault === "overflow" &&
                    e.message.startsWith(error));
            });
        });
    }

    it(`correctly fails on nad toBeArray values: negative value`, function() {
        assert.throws(() => {
            const result = toBeArray(-4);
            console.log(result);
        }, (e: any) => {
            return (isError(e, "NUMERIC_FAULT") && e.fault === "overflow" &&
                e.message.startsWith("unsigned value cannot be negative"));
        });
    });
});
