import assert from "assert";

import { FetchRequest, isError, toUtf8Bytes } from "../index.js";

type Reply = {
    statusCode: number;
    retryAfter?: string;
};

function createRequest(replies: Array<Reply>): {
    request: FetchRequest;
    attempts: Array<number>;
} {
    const attempts: Array<number> = [ ];
    const request = new FetchRequest("https://example.com/");
    request.getUrlFunc = async () => {
        const reply = replies[Math.min(attempts.length, replies.length - 1)];
        attempts.push(Date.now());
        const headers: Record<string, string> = { };
        if (reply.retryAfter != null) { headers["retry-after"] = reply.retryAfter; }
        return {
            statusCode: reply.statusCode,
            statusMessage: reply.statusCode === 200 ? "OK": "Too Many Requests",
            headers,
            body: toUtf8Bytes("test response")
        };
    };
    return { request, attempts };
}

describe("FetchRequest throttling", function() {
    this.timeout(10000);

    for (const seconds of [ 1, 2 ]) {
        it(`waits Retry-After seconds before retrying: ${ seconds }`, async function() {
            const { request, attempts } = createRequest([
                { statusCode: 429, retryAfter: String(seconds) },
                { statusCode: 200 }
            ]);

            const response = await request.send();
            assert.equal(response.statusCode, 200);
            assert.equal(attempts.length, 2);
            assert.ok(attempts[1] - attempts[0] >= seconds * 1000,
                "retried before Retry-After elapsed");
        });
    }

    it("honors Retry-After on consecutive throttled responses", async function() {
        const { request, attempts } = createRequest([
            { statusCode: 429, retryAfter: "1" },
            { statusCode: 429, retryAfter: "1" },
            { statusCode: 200 }
        ]);

        const response = await request.send();
        assert.equal(response.statusCode, 200);
        assert.equal(attempts.length, 3);
        for (let i = 1; i < attempts.length; i++) {
            assert.ok(attempts[i] - attempts[i - 1] >= 1000,
                "retried before Retry-After elapsed");
        }
    });

    for (const retryAfter of [ undefined, "soon" ]) {
        it(`uses throttle parameters without a numeric Retry-After: ${ retryAfter }`, async function() {
            const { request, attempts } = createRequest([
                { statusCode: 429, retryAfter },
                { statusCode: 200 }
            ]);
            request.setThrottleParams({ slotInterval: 0, maxAttempts: 2 });

            assert.equal((await request.send()).statusCode, 200);
            assert.equal(attempts.length, 2);
        });
    }

    it("allows retryFunc to reject a retry", async function() {
        const { request, attempts } = createRequest([
            { statusCode: 429, retryAfter: "1" }
        ]);
        let retries = 0;
        request.retryFunc = async (_req, response, attempt) => {
            retries++;
            assert.equal(response.statusCode, 429);
            assert.equal(attempt, 0);
            return false;
        };

        assert.equal((await request.send()).statusCode, 429);
        assert.equal(retries, 1);
        assert.equal(attempts.length, 1);
    });

    it("preserves the maximum retry limit", async function() {
        const { request, attempts } = createRequest([
            { statusCode: 429, retryAfter: "1" }
        ]);
        request.setThrottleParams({ maxAttempts: 2 });

        const response = await request.send();
        assert.equal(attempts.length, 2);
        assert.ok(attempts[1] - attempts[0] >= 1000,
            "retried before Retry-After elapsed");
        assert.throws(() => response.assertOk(), (error: any) => {
            return isError(error, "SERVER_ERROR");
        });
    });

    it("does not wait when no retry attempts remain", async function() {
        const { request, attempts } = createRequest([
            { statusCode: 429, retryAfter: "60" }
        ]);
        request.setThrottleParams({ maxAttempts: 1 });

        const response = await request.send();
        assert.equal(attempts.length, 1);
        assert.throws(() => response.assertOk(), (error: any) => {
            return isError(error, "SERVER_ERROR");
        });
    });

    it("does not retry a successful response with Retry-After", async function() {
        const { request, attempts } = createRequest([
            { statusCode: 200, retryAfter: "60" }
        ]);

        assert.equal((await request.send()).statusCode, 200);
        assert.equal(attempts.length, 1);
    });

    it("keeps processFunc throttle stalls in milliseconds", async function() {
        const { request, attempts } = createRequest([{ statusCode: 200 }]);
        let responses = 0;
        request.processFunc = async (_req, response) => {
            if (responses++ === 0) { response.throwThrottleError("test throttle", 25); }
            return response;
        };

        assert.equal((await request.send()).statusCode, 200);
        assert.equal(attempts.length, 2);
        assert.ok(attempts[1] - attempts[0] >= 25, "retried before throttle stall elapsed");
    });

    const timeoutCases = [
        { name: "Retry-After beyond the request lifetime", header: "1" },
        { name: "Retry-After below the timer limit", header: "2147483" },
        { name: "Retry-After above the timer limit", header: "2147484" },
        { name: "Retry-After beyond numeric range", header: "9".repeat(400) }
    ];
    for (const test of timeoutCases) {
        it(`does not retry after timeout: ${ test.name }`, async function() {
            this.timeout(1000);
            const { request, attempts } = createRequest([
                { statusCode: 429, retryAfter: test.header },
                { statusCode: 200 }
            ]);
            request.timeout = 25;

            await assert.rejects(request.send(), (error: any) => {
                return isError(error, "TIMEOUT");
            });
            assert.equal(attempts.length, 1);
        });
    }

    it("preserves cancellation when a throttle wait reaches the timeout", async function() {
        this.timeout(2000);
        const { request, attempts } = createRequest([{ statusCode: 200 }]);
        request.timeout = 25;
        request.processFunc = async (_req, response) => {
            response.throwThrottleError("test throttle", 1000);
            return response;
        };

        const sent = request.send();
        const cancel = setTimeout(() => request.cancel(), 5);
        try {
            await assert.rejects(sent, (error: any) => {
                return isError(error, "CANCELLED");
            });
            assert.equal(attempts.length, 1);
        } finally {
            clearTimeout(cancel);
        }
    });
});
