import {
    FetchRequest
} from "../utils/index.js";
import type { Networkish } from "./network.js";
import { JsonRpcApiProviderOptions, JsonRpcPayload, JsonRpcProvider, JsonRpcResult } from "./provider-jsonrpc";

type Attestation = {
    
}

export type AttestableJsonRpcResult = JsonRpcResult & {

};

export class StatelessProvider extends JsonRpcProvider {
    
    constructor(url?: string | FetchRequest, network?: Networkish, options?: JsonRpcApiProviderOptions) {
        super(url, network, options)
    }

    async _send(payload: JsonRpcPayload | Array<JsonRpcPayload>): Promise<Array<AttestableJsonRpcResult>> {
        // Configure a POST connection for the requested method
        const request = this._getConnection();
        request.body = JSON.stringify(payload);
        request.setHeader("content-type", "application/json");

        const response = await request.send();
        response.assertOk();

        let resp = response.bodyJson;
        if (!Array.isArray(resp)) { resp = [ resp ]; }

        return resp;
    }
}