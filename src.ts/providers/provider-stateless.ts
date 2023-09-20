import {
    FetchRequest
} from "../utils/index.js";
import type { Networkish } from "./network.js";
import { JsonRpcApiProviderOptions, JsonRpcPayload, JsonRpcProvider, JsonRpcResult } from "./provider-jsonrpc";

/**
 * An attestation consists of the signature of the attester and cryptographic proof
 */
export type Attestation = {
    /**
     * The signature of the attester
     */
    signature: string;
  
    /**
     * The signature format (i.e. "ssh-ed25519")
     */
    signatureFormat: string;
  
    /**
     * The hashing algorithm used to hash the data (i.e. "sha256")
     */
    hashAlgo: string;
  
    /**
     * The hashed message data
     */
    msg: string;
  
    /**
     * The identifier of the attester
     */
    identity: string;
  };
  
  /**
   *  A JSON-RPC result, which are returned on success from a JSON-RPC server.
   */
  export type AttestableJsonRpcResult = JsonRpcResult & {
  
    /**
     * Attestation data for the request.
     */
    attestations: Array<Attestation>;
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