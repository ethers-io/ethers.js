import { decodeBase64 } from "@ethersproject/bytes";
import { toUtf8Bytes } from "@ethersproject/strings"

import { getUrl } from "./get-url.js"; /*-browser*/
import { logger } from "./logger.js";
import { FetchRequest } from "./request.js";
import { FetchResponse } from "./response.js";

import type { Frozen } from "@ethersproject/properties";


async function delay(duration: number): Promise<void> {
    return new Promise((resolve) => { setTimeout(resolve, duration); });
}

export type PreflightRequestFunc = (request: Frozen<FetchRequest>) => Promise<FetchRequest>;
export type ProcessResponseFunc = (request: Frozen<FetchRequest>, response: FetchResponse) => Promise<FetchResponse>;
export type ThrottleRetryFunc = (request: Frozen<FetchRequest>, response: FetchResponse, attempt: number) => Promise<boolean>;

export type FrozenFetchRequest = Frozen<FetchRequest>;
export type FrozenFetchResponse = Frozen<FetchResponse>;

export type ConnectionInfo = {
    // The request
    request: FetchRequest;

    // Called each time a request is about to be sent to the network; in
    // the case of a throttle event, this may occur multiple times
    // @TODO: Allow the prflight to directly make the request and respond?
    //preflightRequest?: (request: Frozen<FetchRequest>) => Promise<FetchRequest | FetchResponse>
    preflightRequest?: PreflightRequestFunc;

    // If the response.throwThrottleError() is used the throttleConfig is
    // used to determine when and if to retry
    processResponse?: ProcessResponseFunc;

    // Throttling Configuration
    throttleLimit?: number;
    throttleSlotInterval?: number;
    throttleRetry?: ThrottleRetryFunc;
};

// @TODO: Add option for global preflightRequest?

function getTime(): number { return (new Date()).getTime(); }

function unpercent(value: string): Uint8Array {
    value = value.replace(/%([0-9a-f][0-9a-f])/gi, (all, code) => {
        return String.fromCharCode(parseInt(code, 16));
    });
    return toUtf8Bytes(value);
}

export type GatewayFunc = (url: string) => Promise<FetchRequest | FetchResponse>

let lockGateways = false;
let ipfsGateway: null | string | GatewayFunc = "https:/\/gateway.ipfs.io/";
let arGateway: null | string | GatewayFunc = "https:/\/gateway.ar.io/";

export async function fetchData(connection: string | FetchRequest | ConnectionInfo): Promise<Frozen<FetchResponse>> {
    const conn = (typeof(connection) === "string") ? {
        request: new FetchRequest(connection)
    }: (connection instanceof FetchRequest) ? {
        request: connection
    }: Object.assign({ }, connection);

    if (conn.request == null) {
        return logger.throwArgumentError("missing request", "connection", connection);
    }

    let req = conn.request.clone().freeze();

    switch (conn.request.url.split(":")[0]) {
        case "data": {
            const match = req.url.match(/^data:([^;:]*)?(;base64)?,(.*)$/i);
            if (match) {
                try {
                    const headers = {
                        "content-type": (match[1] ? match[1]: "text/plain")
                    };
                    const body = (match[2] ? decodeBase64(match[3]): unpercent(match[3]));
                    return new FetchResponse(200, "OK", headers, body, req.clone());
                } catch (error) {
                    return new FetchResponse(400, "BAD REQUEST (invalid base64 encoded data)", { }, null, req.clone());
                }
            }
            return new FetchResponse(500, "INTERNAL SERVER ERROR (unsupported dara URI)", { }, null, req.clone());
        }
        case "ipfs":
        case "ipns":
        case "ar":
            throw new Error("not implemented yet");
            console.log("FF", arGateway, ipfsGateway);
        case "http": case "https":
            break;
        default:
            throw new Error("unsupported scheme");
    }

    const attempts = (conn.throttleLimit != null) ? conn.throttleLimit: 12;
    if (!Number.isInteger(attempts) || attempts < 1) {
        return logger.throwArgumentError("invalid throttleLimit", "connection", connection);
    }

    const slotInterval = (conn.throttleSlotInterval != null) ? conn.throttleSlotInterval: 100;
    //logger.assertInteger(slotInterval, "connection.throttleSlotInterval", connection.throttleSlotInterval);
    if (!Number.isInteger(slotInterval) || attempts < 0) {
        return logger.throwArgumentError("invalid throttleSlotInterval", "connection", connection);
    }

    const retryFunc = (conn.throttleRetry != null) ? conn.throttleRetry: null;
    if (retryFunc && typeof(retryFunc) !== "function") {
        return logger.throwArgumentError("invalid throttleRetry callback", "connection", connection);
    }

    const preflightRequest = conn.preflightRequest || null;
    if (preflightRequest && typeof(preflightRequest) !== "function") {
        return logger.throwArgumentError("invalid preflightRequest callback", "connection", connection);
    }

    const processResponse = conn.processResponse || null;
    if (processResponse && typeof(processResponse) !== "function") {
        return logger.throwArgumentError("invalid processResponse callback", "connection", connection);
    }

    // Start time of this fetch (for timeouts)
    const t0 = getTime();

    let response: null | FetchResponse = null;
    for (let a = 0; a < attempts; a++) {
        let request = req.clone();

        if (preflightRequest) {
            request = (await preflightRequest(request.freeze())).clone();
        }

        const remainingTime = getTime() - t0;
        if (remainingTime < 0) {
            return logger.throwError("timeout", "TIMEOUT", { operation: "request", request });
        }

        response = await getUrl(request, remainingTime);

        // Retry logic (server forced)
        if (a < attempts) {
            if (response.statusCode === 301 || response.statusCode === 302) {
                // Try following the redirect; the request will through if the
                // type of redirect is not supported
                try {
                    req = request.redirect(response.headers.location || "");
                    continue;
                } catch (error) { };

                // Things won't get any better on another attempt; abort
                return response;

            } else if (response.statusCode === 429) {
                if (retryFunc == null || (await retryFunc(request.freeze(), response, a))) {
                    const retryAfter = response.headers["retry-after"];
                    if (typeof(retryAfter) === "string" && retryAfter.match(/^[1-9][0-9]*$/)) {
                        await delay(parseInt(retryAfter));
                    } else {
                        await delay(slotInterval * Math.trunc(Math.random() * Math.pow(2, a)));
                    }
                    continue;
                }
            }
        }

        // Optional post-processing response; also allows trapping
        // HTTP status errors and doing "something different",
        // including any further throttling.
        if (processResponse) {
            try {
                return await processResponse(request, response);
            } catch (error: any) {

                // response.throwThrottleError
                if (error.throttle && typeof(error.stall) === "number") {
                    if (a < attempts) {
                        await delay(error.stall);
                        continue;
                    }

                    // Too many retries should behave more like a 5xx server error
                    return response.makeServerError("exceeded maximum retry limit", error);
                }

                // Something went wrong during processing; throw a 5xx server error
                response.makeServerError("error in post-processing function", error).assertOk();
            }
        }

        return response;
    }

    // Too many retries should behave more like a 5xx server error
    return (<FetchResponse>response).makeServerError("exceeded maximum retry limit");
}

fetchData.lock = function(): void {
    lockGateways = true;
}

// @TODO: Allow a master Gateway function
fetchData.setGateway = function(gateway: null | GatewayFunc): void {
}

fetchData.setIpfsGateway = function(gateway: null | string | GatewayFunc): void {
    if (lockGateways) {
        logger.throwError("gateways are locked", "UNSUPPORTED_OPERATION", {
            operation: "setIpfsGateway" });
    }
    ipfsGateway = gateway;
};

fetchData.setArGateway = function(gateway: null | string | GatewayFunc): void {
    if (lockGateways) {
        logger.throwError("gateways are locked", "UNSUPPORTED_OPERATION", {
            operation: "setArGateway" });
    }
    arGateway = gateway;
};

