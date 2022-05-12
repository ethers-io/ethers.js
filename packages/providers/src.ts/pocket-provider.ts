"use strict";

import { Network, Networkish } from "@ethersproject/networks";
import { getStatic } from "@ethersproject/properties";
import { ConnectionInfo } from "@ethersproject/web";

import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
const logger = new Logger(version);

import { UrlJsonRpcProvider } from "./url-json-rpc-provider";


export class PocketProvider extends UrlJsonRpcProvider {
    readonly applicationId: string;
    readonly applicationSecretKey: string;

    static getApiKey(apiKey: any): any {
        // Most API Providers allow null to get the default configuration, but
        // Pocket requires the network to decide the default provider, so we
        // rely on hijacking the constructor to add a sensible default for us

        if (apiKey == null) {
            logger.throwArgumentError("PocketProvider.getApiKey does not support null apiKey", "apiKey", apiKey);
        }

        const apiKeyObj: { applicationId: string, applicationSecretKey: string } = {
            applicationId: null,
            applicationSecretKey: null
        };

        // Parse applicationId and applicationSecretKey
        if (typeof (apiKey) === "string") {
            apiKeyObj.applicationId = apiKey;

        } else if (apiKey.applicationSecretKey != null) {
            logger.assertArgument((typeof (apiKey.applicationId) === "string"),
                "applicationSecretKey requires an applicationId", "applicationId", apiKey.applicationId);
            logger.assertArgument((typeof (apiKey.applicationSecretKey) === "string"),
                "invalid applicationSecretKey", "applicationSecretKey", "[REDACTED]");

            apiKeyObj.applicationId = apiKey.applicationId;
            apiKeyObj.applicationSecretKey = apiKey.applicationSecretKey;

        } else if (apiKey.applicationId) {
            logger.assertArgument((typeof (apiKey.applicationId) === "string"),
                "apiKey.applicationId must be a string", "apiKey.applicationId", apiKey.applicationId);

            apiKeyObj.applicationId = apiKey.applicationId;

        } else {
            logger.throwArgumentError("unsupported PocketProvider apiKey", "apiKey", apiKey);
        }

        return apiKeyObj;
    }

    static getUrl(network: Network, apiKey: any): ConnectionInfo {
        let host: string = null;
        switch (network ? network.name : "unknown") {
            case "homestead":
                host = "eth-mainnet.gateway.pokt.network";
                break;
            case "ropsten":
                host = "eth-ropsten.gateway.pokt.network";
                break;
            case "rinkeby":
                host = "eth-rinkeby.gateway.pokt.network";
                break;
            case "goerli":
                host = "eth-goerli.gateway.pokt.network";
                break;
	    case "kovan":
	    	host = "poa-kovan.gateway.pokt.network";
	    	break;
	    case "xdai":
		host = "gnosischain-mainnet.gateway.pokt.network";
	    	break;
	    case "matic":
	        host = "poly-mainnet.gateway.pokt.network";
	    	break;
	    case "bnb":
	        host = "bsc-mainnet.gateway.pokt.network";
		break;
            default:
                logger.throwError("unsupported network", Logger.errors.INVALID_ARGUMENT, {
                    argument: "network",
                    value: network
                });
        }

        const url = `https:/\/${ host }/v1/lb/${ apiKey.applicationId }`

        const connection: ConnectionInfo = { url };

        // Initialize empty headers
        connection.headers = {}

        // Apply application secret key
        if (apiKey.applicationSecretKey != null) {
            connection.user = "";
            connection.password = apiKey.applicationSecretKey
        }

        return connection;
    }

    isCommunityResource(): boolean {
        return false;
    }
}
