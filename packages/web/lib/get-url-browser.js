import { logger } from "./logger.js";
import { FetchResponse } from "./response.js";
export async function getUrl(req, timeout) {
    const protocol = req.url.split(":")[0].toLowerCase();
    if (protocol !== "http" && protocol !== "https") {
        logger.throwError(`unsupported protocol ${protocol}`, "UNSUPPORTED_OPERATION", {
            info: { protocol },
            operation: "request"
        });
    }
    if (req.credentials && !req.allowInsecureAuthentication) {
        logger.throwError("insecure authorized connections unsupported", "UNSUPPORTED_OPERATION", {
            operation: "request"
        });
    }
    const init = {
        method: req.method,
        headers: new Headers(Array.from(req)),
        body: req.body || undefined,
    };
    const resp = await fetch(req.url, init);
    const headers = {};
    resp.headers.forEach((value, key) => {
        headers[key.toLowerCase()] = value;
    });
    const body = new Uint8Array(await resp.arrayBuffer());
    return new FetchResponse(resp.status, resp.statusText, headers, body, req);
}
//# sourceMappingURL=get-url-browser.js.map