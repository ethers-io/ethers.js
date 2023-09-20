"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatelessProvider = void 0;
const provider_jsonrpc_1 = require("./provider-jsonrpc");
class StatelessProvider extends provider_jsonrpc_1.JsonRpcProvider {
    constructor(url, network, options) {
        super(url, network, options);
    }
    async _send(payload) {
        // Configure a POST connection for the requested method
        const request = this._getConnection();
        request.body = JSON.stringify(payload);
        request.setHeader("content-type", "application/json");
        const response = await request.send();
        response.assertOk();
        let resp = response.bodyJson;
        if (!Array.isArray(resp)) {
            resp = [resp];
        }
        return resp;
    }
}
exports.StatelessProvider = StatelessProvider;
//# sourceMappingURL=provider-stateless.js.map