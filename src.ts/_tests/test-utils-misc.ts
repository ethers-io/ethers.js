import assert from "assert";
import { createServer } from "node:http";
import { performance } from "node:perf_hooks";

import {
    decodeBase64, encodeBase64,
    defineProperties, isError,
    toUtf8Bytes,
    FetchRequest
} from "../index.js";


describe("Base64 Coding", function() {
    const tests = [
        {
            name: "wikipedia",
            plaintext: toUtf8Bytes("Many hands make light work."),
            encoded: "TWFueSBoYW5kcyBtYWtlIGxpZ2h0IHdvcmsu"
        }
    ];

    for (const test of tests) {
        it(`encodes base64: ${ test.name }`, function() {
            assert.equal(encodeBase64(test.plaintext), test.encoded);
        });
    }

    for (const test of tests) {
        it(`decodes base64: ${ test.name }`, function() {
            const decoded = decodeBase64(test.encoded);
            assert.equal(decoded.length, test.plaintext.length, "data.length");
            for (let i = 0; i < decoded.length; i++) {
                assert.equal(decoded[i], test.plaintext[i]);
            }
        });
    }
});

describe("FetchRequest", function() {
    it("respects a numeric Retry-After header in seconds", async function() {
        this.timeout(10000);

        const arrivals: Array<number> = [];

        const server = createServer((_req, res) => {
            const now = performance.now();

            arrivals.push(now);

            if (now - arrivals[0] < 1000) {
                res.writeHead(429, { "Retry-After": "1" });
                res.end("rate limited");
            } else {
                res.writeHead(200);
                res.end("ok");
            }
        });

        await new Promise<void>((resolve) => { server.listen(0, "127.0.0.1", resolve); });

        try {
            const address = server.address();
            assert.ok(address != null && typeof(address) !== "string");

            const response = await new FetchRequest(`http://127.0.0.1:${ address.port }`).send();
            response.assertOk();

            assert.equal(response.statusCode, 200, "statusCode");
            assert.equal(arrivals.length, 2, "requests");
            assert.ok(arrivals[1] - arrivals[0] >= 900, "retry delay");
        } finally {
            server.closeAllConnections();
            await new Promise<void>((resolve) => { server.close(() => { resolve(); }); });
        }
    });
});

describe("Test Minor Features", function() {
    it("checks types in defineProperties", function() {
        const any = { };

        const values = {
            vAny: any,
            vBigint: BigInt(60),
            vBoolean: true,
            vNumber: 42,
            vString: "some string",
        };

        const item: any = { };
        defineProperties(item, values, {
            vAny: "any",
            vBigint: "bigint",
            vBoolean: "boolean",
            vNumber: "number",
            vString: "string"
        });

        assert.equal(item.vAny, any, "vAny");
        assert.equal(item.vBoolean, true, "vBoolenay");
        assert.equal(item.vNumber, 42, "nNumber");
        assert.equal(item.vString, "some string", "any");
    });

    it("correctly throws if defineProperty type mismatch", function() {
        assert.throws(() => {
            const item: any = { };

            const values = { vBoolean: 42 };
            defineProperties(item, values, { vBoolean: "boolean" });

            console.log(values);
        }, (error) => {
            return (isError(error, "INVALID_ARGUMENT") &&
                error.argument === "value.vBoolean" &&
                error.value === 42);
        });
    });
});
