"use strict";

import { ethers } from "ethers";
import { fetchJson } from "@ethersproject/web";
import { GsnRelayHub } from "./gsn-relay-hub";
import { GsnRelayer, GsnRelayPinger } from "./gsn-relay-pinger";


import { version } from "./_version";
const logger = new ethers.utils.Logger(version);

// prefix used to encode relay transaction
const relayPrefix = 'rlx:';
const userAgent = `ethers-gsn-signer-${version}`;
const LOOKUP_BLOCK_LIMIT = 6000;
const MAX_RELAY_TIMEOUT_GRACE_SEC = 60 * 30;
const MAX_NONCE_GAP = 3;
const DEFAULT_RELAY_PING_SIZE = 3;
const TX_RELAYED_TOPIC = '0xab74390d395916d9e0006298d47938a5def5d367054dcca78fa6ec84381f3f22';

type approveFunc = (params: GsnApproveParams) => Promise<ethers.BytesLike>;
type waitFunc = (confirmations?: number) => Promise<ethers.providers.TransactionReceipt>;
type failedRelayRecord = Record<string, { lastError: number }>;
type relayScoreFunc = (r: GsnRelayer) => number;
type relayFilterFunc = (r: GsnRelayer) => boolean;



function waitForReceipt(provider: ethers.providers.Provider, hash: string, hubAddress? : string): waitFunc {
    const abi = ['event TransactionRelayed(address indexed relay, address indexed from, address indexed to, bytes4 selector, uint8 status, uint256 charge)'];
    const iface = new ethers.utils.Interface(abi);
    return (confirmations?: number) => provider.waitForTransaction(hash, confirmations)
           .then((receipt: ethers.ContractReceipt) => {
               receipt.logs.forEach(l => {
                   if(l.address === hubAddress && l.topics[0] === TX_RELAYED_TOPIC) {
                       const parsed = iface.parseLog(l);
                       if( parsed.args.status !== 0 ) {
                           logger.throwError(`Transaction failed to be relayed, status=${parsed.args.status}`, ethers.errors.SERVER_ERROR);
                       }
                   }
               });

               return receipt;
           });
}

// these are defaults/options used to populate relay transactions
export type GsnOptions = {
    allowedRelayNonceGap?: number,
    fixedGasPrice?: number,
    preferredRelayers?: Array<GsnRelayer>,
    approveFunction?: approveFunc,
    calculateScoreFunc?: relayScoreFunc,
    relayFilter?: relayFilterFunc,
    relayLookupWindowBlocks?: number,
    relayTimeoutGrace?: number,
    minStake?: number,
    minDelay?: number,
    sliceSize?: number
};

export interface GsnApproveParams {
    encodedFunction?: ethers.BytesLike,
    from?: string,
    to?: string,
    gasPrice?: number,
    gasLimit?: number,
    relayFee?: number,
    recipientNonce?: number,
    relayMaxNonce?: number,
    relayHubAddress?: string,
    relayAddress?: string,
    chainId?: number
}

interface GsnPayload extends GsnApproveParams {
    approvalData?: ethers.BytesLike,
    signature?: ethers.BytesLike,
    userAgent?: string
}

interface GsnTransactionResponse extends ethers.providers.TransactionResponse {
    relayedTransaction?: ethers.providers.TransactionRequest
}

type RelayResponse = {
    error?: string,
    nonce?: ethers.BytesLike,
    gasPrice?: ethers.BytesLike,
    gas?: ethers.BytesLike,
    to?: string,
    value?: string,
    input?: string,
    v?: string,
    r?: string,
    s?: string,
    hash?: string,
}

function compareRelayScores(r1: GsnRelayer, r2: GsnRelayer) {
    let diff = r2.score - r1.score;
    if (diff === 0) {
        diff = Math.random() - 0.5;
    }
    return diff;
}

async function broadcastTransaction(provider: ethers.providers.Provider, tx: ethers.Transaction): Promise<void> {
    const unsignedTx = {
        to: tx.to,
        nonce: tx.nonce,
        gasLimit: tx.gasLimit,
        gasPrice: tx.gasPrice,
        data: tx.data,
        value: tx.value,
        chainId: tx.chainId
    };
    const signature = { r: tx.r, s: tx.s, v: tx.v };
    const signedTx = ethers.utils.serializeTransaction(unsignedTx, signature);
    await provider.sendTransaction(signedTx).catch(error => {
        const message = error.message || '';

        // different nodes give different error message
        if( !message.match(/the tx doesn't have the correct nonce|known transaction/)) {
            logger.throwError(`Failed to broadcast signed transaction from relayer. ${message} transaction: ${JSON.stringify(tx)}`, ethers.errors.SERVER_ERROR);
        }
    });
}

// see https://github.com/OpenZeppelin/openzeppelin-gsn-provider/blob/36effe650a1b8f70a7f9849415af9617543a5e90/src/tabookey-gasless/RelayClient.js#L108
function validateResponse(result: RelayResponse, request: GsnPayload ): ethers.Transaction {
    if (result.error) {
        logger.throwError(`${result.error}`);
    }

    if (!result.nonce) {
        logger.throwError(`Missing nonce`);
    }

    const nonce = ethers.BigNumber.from(result.nonce).toNumber();
    if (nonce > request.relayMaxNonce) {
        const message = 'Relay nonce is higher than requested. ' +
                        `Requested ${request.relayMaxNonce} got ${nonce}`;
        logger.throwError(message);
    }

    const tx: ethers.Transaction = {
      nonce,
      gasPrice: ethers.BigNumber.from(result.gasPrice),
      gasLimit: ethers.BigNumber.from(result.gas),
      to: result.to,
      value: ethers.BigNumber.from(result.value),
      data: result.input,
      chainId: null
    };

    const txDigest = ethers.utils.keccak256(ethers.utils.serializeTransaction(tx));
    const signature = ethers.utils.splitSignature({r: result.r, s: result.s, v: ethers.BigNumber.from(result.v).toNumber()});
    const signer = ethers.utils.recoverAddress(txDigest, signature);
    if (signer !== request.relayAddress) {
         logger.throwError(`Invalid signer ${signer}; expected ${request.relayAddress}`);
    }

    const signedHash = ethers.utils.keccak256(ethers.utils.serializeTransaction(tx, signature));
    if (signedHash !== result.hash) {
         logger.throwError(`Invalid hash ${signedHash} expected ${result.hash}`);
    }

    const args = GsnRelayHub.parseTransaction(result.input);
    const hash = hashGsnTransaction({
         from: args.from,
         to: args.to,
         encodedFunction: args.encodedFunction,
         relayFee: ethers.BigNumber.from(args.transactionFee).toNumber(),
         gasPrice: ethers.BigNumber.from(args.gasPrice).toNumber(),
         gasLimit: ethers.BigNumber.from(args.gasLimit).toNumber(),
         recipientNonce: ethers.BigNumber.from(args.nonce).toNumber(),
         relayHubAddress: result.to,
         relayAddress: signer});


    const expectedHash = hashGsnTransaction(request);
    if (hash !== expectedHash) {
         logger.throwError(`Invalid hash ${hash}, expected ${expectedHash}`);
    }

    tx.r = signature.r;
    tx.s = signature.s;
    tx.v = signature.v;
    tx.from = signer;
    tx.hash = result.hash;

    return tx;
}


function hashGsnTransaction(tx: GsnPayload): string {

    const dataToHash = ethers.utils.concat([
         ethers.utils.toUtf8Bytes(relayPrefix),
         ethers.utils.arrayify(tx.from),
         ethers.utils.arrayify(tx.to),
         tx.encodedFunction,
         ethers.utils.hexZeroPad(ethers.BigNumber.from(tx.relayFee).toHexString(), 32),
         ethers.utils.hexZeroPad(ethers.BigNumber.from(tx.gasPrice).toHexString(), 32),
         ethers.utils.hexZeroPad(ethers.BigNumber.from(tx.gasLimit).toHexString(), 32),
         ethers.utils.hexZeroPad(ethers.BigNumber.from(tx.recipientNonce).toHexString(), 32),
         tx.relayHubAddress,
         tx.relayAddress]);

    return ethers.utils.keccak256(dataToHash);
}

function getApprovalData(approveFunction: approveFunc = null, params: GsnApproveParams): Promise<ethers.BytesLike> {
    return (typeof approveFunction === 'function'? approveFunction(params) : Promise.resolve('0x'));
}

function defaultScoreFunction(relayer: GsnRelayer): number {
   // the lower the relayFee, the better the score
   let score = 1000 - relayer.relayFee;

   const relay = this.failedRelays[relayer.url];
   if (relay) {
       const elapse = (new Date().getTime() - relay.lastError)/1000;
       if( elapse < this.relayTimeoutGrace) {
           score -= 10;
       }
   }
   return score;
}

export class GsnSigner extends ethers.Signer {
    readonly signer: ethers.Signer;
    readonly options: GsnOptions;
    relayHub: GsnRelayHub;
    failedRelays: failedRelayRecord;
    relayLookupWindowBlocks: number;          // number of block to scan backward for relayers added/removed events
    relayTimeoutGrace: number;                // graylist relayers that failed to respond for this number of seconds
    allowedRelayNonceGap: number;             // maximum gap allowed for relayers nonce
    calculateScore: relayScoreFunc;           // logic to sort relayer by score
    relayFilter: relayFilterFunc;             // logic to filter out relayer
    relayPingSize: number;                        // relayer ping batch size

    constructor(signer: ethers.Signer, options: GsnOptions = {}) {
        logger.checkNew(new.target, GsnSigner);

        super();

        ethers.utils.defineReadOnly(this, "signer", signer);
        ethers.utils.defineReadOnly(this, "options", options);

        this.relayLookupWindowBlocks= options.relayLookupWindowBlocks || LOOKUP_BLOCK_LIMIT;
        this.relayTimeoutGrace = options.relayTimeoutGrace || MAX_RELAY_TIMEOUT_GRACE_SEC;
        this.allowedRelayNonceGap = options.allowedRelayNonceGap || MAX_NONCE_GAP;
        this.relayPingSize = options.sliceSize|| DEFAULT_RELAY_PING_SIZE;
        this.failedRelays = {};

        this.calculateScore = options.calculateScoreFunc || defaultScoreFunction.bind(this);

        this.relayFilter = options.relayFilter ||
            (relay =>
                relay.score &&
                (!options.minDelay || ethers.BigNumber.from(relay.unstakeDelay).gte(options.minDelay)) &&
                (!options.minStake || ethers.BigNumber.from(relay.stake).gte(options.minStake)));
    }

    get provider(): ethers.providers.Provider {
        return this.signer.provider;
    }

    getAddress(): Promise<string> {
        return this.signer.getAddress();
    }

    signMessage(message: ethers.utils.Bytes | string): Promise<string> {
        return this.signer.signMessage(message);
    }

    signTransaction(transaction: ethers.providers.TransactionRequest): Promise<string> {
        return this.signer.signTransaction(transaction);
    }

    async sendTransaction(transaction: ethers.providers.TransactionRequest): Promise<GsnTransactionResponse> {

        let tx = await ethers.utils.resolveProperties(transaction);

        if (tx.value && ethers.BigNumber.from(tx.value).gt(0)) {
            logger.throwArgumentError('GSN signer does not support sending ether', 'transaction.value', tx.value);
        }

        // set nonce to 0 so populateTransaction will not populate it, nonce will be calculated later
        tx.nonce = 0;
        const popTx = await this.populateTransaction(tx)
        tx = await ethers.utils.resolveProperties(popTx);

        const pingOptions = { gasPrice: tx.gasPrice, pingSize: this.relayPingSize };

        const relayHub = await this._getRelayHub(tx.to);

        let response;
        if (this.options.preferredRelayers && this.options.preferredRelayers.length > 0) {
           const pinger = new GsnRelayPinger(this.options.preferredRelayers, pingOptions);
           response = await this._relayTransaction(tx, relayHub, pinger);
        }

        if (!response) {
           const currentBlock = await this.provider.getBlockNumber();
           const fromBlock = Math.max(0, currentBlock - this.relayLookupWindowBlocks);
           const activeRelayers = await relayHub.fetchRelayers(fromBlock);
           const filtered = this.filterAndSortRelayers(activeRelayers);
           const pinger = new GsnRelayPinger(filtered, pingOptions);
           response = await this._relayTransaction(tx, relayHub, pinger);
        }

        if (!response) {
           logger.throwError("Unable to send transaction, see previous error for more details.", ethers.errors.SERVER_ERROR);
        }

        return response;
    }

    connect(provider: ethers.providers.Provider): ethers.Signer {
        return new GsnSigner(this.signer.connect(provider));
    }

    async estimateGas(transaction: ethers.providers.TransactionRequest): Promise<ethers.BigNumber> {

        const tx = await ethers.utils.resolveProperties(transaction);

        if( !tx.data ) {
            const message = 'missing transaction data; gsn signer only supports contract function calls';
            logger.throwArgumentError(message, 'transaction.data', tx.data);
        }

        try {
            const relayHub = await GsnRelayHub.createFromRecipient(this.provider, tx.to);
            tx.from = relayHub.address;
        } catch (error) {
            logger.throwError('contract does not support GSN', ethers.errors.SERVER_ERROR);
        }

        const from = await this.getAddress();
        tx.data = ethers.utils.concat([tx.data, ethers.utils.hexZeroPad(from, 32)])

        const estimate = await this.provider.estimateGas(tx);
        return estimate;
    }

    filterAndSortRelayers(relayers: Array<GsnRelayer>): Array<GsnRelayer> {
        const result = relayers.map(r => {
                            const score = this.calculateScore(r);
                            return Object.assign({}, r, { score });
                       })
                      .filter(this.relayFilter)
                      .sort(compareRelayScores);
        if( result.length === 0 ) {
            return logger.throwError("No relayer matches filter criteria", ethers.errors.SERVER_ERROR);
        }

        return result;
    }

    async _createPayload(transaction: ethers.providers.TransactionRequest, relayHub: GsnRelayHub, relayer: GsnRelayer): Promise<GsnPayload> {
        const tx = await ethers.utils.resolveProperties(transaction);
        const nonce = await relayHub.getRecipientNonce(tx.from);
        const relayMaxNonce = await this.provider.getTransactionCount(relayer.address)
                                     .then(count => count + this.allowedRelayNonceGap);

        const payload : GsnPayload = {
            encodedFunction: tx.data,
            from: tx.from,
            to: tx.to,
            gasPrice: ethers.BigNumber.from(tx.gasPrice).toNumber(),
            gasLimit: ethers.BigNumber.from(tx.gasLimit).toNumber(),
            relayFee: ethers.BigNumber.from(relayer.relayFee).toNumber(),
            recipientNonce: nonce.toNumber(),
            relayMaxNonce,
            relayHubAddress: relayHub.address,
            relayAddress: relayer.address,
            chainId: tx.chainId
        };

        const approveFunction = this.options.approveFunction;
        const approvalData = await getApprovalData(approveFunction, payload);
        const hash = hashGsnTransaction(payload);
        const hashBytes = ethers.utils.arrayify(hash);
        const signature = await this.signMessage(hashBytes);

        const signatureBase64 = ethers.utils.base64.encode(ethers.utils.arrayify(signature));
        const approvalDataBase64 = ethers.utils.base64.encode(ethers.utils.arrayify(approvalData));
        payload.approvalData = approvalDataBase64;
        payload.signature = signatureBase64;
        payload.userAgent = userAgent;

        return payload;
    }

    async _relayTransaction( transaction: ethers.providers.TransactionRequest, relayHub: GsnRelayHub, pinger: GsnRelayPinger): Promise<GsnTransactionResponse> {
        const failedUrls = [];
        let response = null;

        while(!response) {
           let relayer = await pinger.nextRelayer();
           if (!relayer) break;

           const payload = await this._createPayload(transaction, relayHub, relayer);
           try {
              const relayResponse = await fetchJson(relayer.url + '/relay', JSON.stringify(payload))
              const validTx = validateResponse(relayResponse, payload);
              await broadcastTransaction(this.provider, validTx);
              return {
                  nonce: validTx.nonce,
                  hash: validTx.hash,
                  gasLimit: validTx.gasLimit,
                  gasPrice: validTx.gasPrice,
                  data: validTx.data,
                  value: validTx.value,
                  chainId: validTx.chainId,
                  confirmations: 0,
                  from: validTx.from,
                  relayedTransaction: transaction,
                  wait: waitForReceipt(this.provider, validTx.hash, relayHub.address)
              };

           } catch (error ) {
              failedUrls.push(relayer.url);
              logger.warn(`${relayer.url} failed; will retry another relayer: ${error}`);
              logger.info('payload: ' +  JSON.stringify(payload));
           }
        }

        this._addFailRelayers(failedUrls.concat(pinger.failedUrls));
        return response;
    }

    async _addFailRelayers( failedUrls: Array<string>) {
        const now = (new Date()).getTime();
        this.failedRelays = failedUrls.reduce((allFailures, url) => {
           allFailures[url] = { lastError: now };
           return allFailures;
        }, this.failedRelays);
    }

    async _getRelayHub(recipient: string): Promise<GsnRelayHub> {
        const relayHub = await GsnRelayHub.createFromRecipient(this.provider, recipient);

        if (!this.relayHub || this.relayHub.address !== relayHub.address) {
            this.relayHub = relayHub;
        }

        return this.relayHub;
    }
}
