import { JsonRpcProvider } from "./provider-jsonrpc";
export class StatelessProvider extends JsonRpcProvider {
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
//# sourceMappingURL=provider-stateless.js.map