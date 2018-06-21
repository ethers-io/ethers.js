declare module "utils/keccak256" {
    import { Arrayish } from "utils/bytes";
    export function keccak256(data: Arrayish): string;
}
declare module "utils/properties" {
    export function defineReadOnly(object: any, name: string, value: any): void;
    export function defineFrozen(object: any, name: string, value: any): void;
    export function resolveProperties(object: any): Promise<any>;
    export function shallowCopy(object: any): any;
    export function jsonCopy(object: any): any;
}
declare module "utils/errors" {
    export const UNKNOWN_ERROR = "UNKNOWN_ERROR";
    export const NOT_IMPLEMENTED = "NOT_IMPLEMENTED";
    export const MISSING_NEW = "MISSING_NEW";
    export const CALL_EXCEPTION = "CALL_EXCEPTION";
    export const INVALID_ARGUMENT = "INVALID_ARGUMENT";
    export const MISSING_ARGUMENT = "MISSING_ARGUMENT";
    export const UNEXPECTED_ARGUMENT = "UNEXPECTED_ARGUMENT";
    export const NUMERIC_FAULT = "NUMERIC_FAULT";
    export const UNSUPPORTED_OPERATION = "UNSUPPORTED_OPERATION";
    export function throwError(message: string, code: string, params: any): never;
    export function checkNew(self: any, kind: any): void;
}
declare module "utils/secp256k1" {
    import { Arrayish } from "utils/bytes";
    export const N: string;
    export interface Signature {
        r: string;
        s: string;
        recoveryParam: number;
        v?: number;
    }
    export class KeyPair {
        readonly privateKey: string;
        readonly publicKey: string;
        readonly compressedPublicKey: string;
        readonly publicKeyBytes: Uint8Array;
        constructor(privateKey: Arrayish);
        sign(digest: Arrayish): Signature;
    }
    export function recoverPublicKey(digest: Arrayish, signature: Signature): string;
    export function computePublicKey(key: Arrayish, compressed?: boolean): string;
    export function recoverAddress(digest: Arrayish, signature: Signature): string;
    export function computeAddress(key: string): string;
}
declare module "utils/bytes" {
    /**
     *  Conversion Utilities
     *
     */
    import { BigNumber } from "utils/bignumber";
    import { Signature } from "utils/secp256k1";
    export type Arrayish = string | ArrayLike<number>;
    export function isArrayish(value: any): boolean;
    export function arrayify(value: Arrayish | BigNumber): Uint8Array;
    export function concat(objects: Array<Arrayish>): Uint8Array;
    export function stripZeros(value: Arrayish): Uint8Array;
    export function padZeros(value: Arrayish, length: number): Uint8Array;
    export function isHexString(value: any, length?: number): boolean;
    export function hexlify(value: Arrayish | BigNumber | number): string;
    export function hexDataLength(data: string): number;
    export function hexDataSlice(data: string, offset: number, length?: number): string;
    export function hexStripZeros(value: string): string;
    export function hexZeroPad(value: string, length: number): string;
    export function splitSignature(signature: Arrayish): Signature;
    export function joinSignature(signature: Signature): string;
}
declare module "utils/bignumber" {
    import { Arrayish } from "utils/bytes";
    export type BigNumberish = BigNumber | string | number | Arrayish;
    export class BigNumber {
        private readonly _bn;
        constructor(value: BigNumberish);
        fromTwos(value: BigNumberish): BigNumber;
        toTwos(value: BigNumberish): BigNumber;
        add(other: BigNumberish): BigNumber;
        sub(other: BigNumberish): BigNumber;
        div(other: BigNumberish): BigNumber;
        mul(other: BigNumberish): BigNumber;
        mod(other: BigNumberish): BigNumber;
        pow(other: BigNumberish): BigNumber;
        maskn(value: BigNumberish): BigNumber;
        eq(other: BigNumberish): boolean;
        lt(other: BigNumberish): boolean;
        lte(other: BigNumberish): boolean;
        gt(other: BigNumberish): boolean;
        gte(other: BigNumberish): boolean;
        isZero(): boolean;
        toNumber(): number;
        toString(): string;
        toHexString(): string;
    }
    export function isBigNumber(value: any): boolean;
    export function bigNumberify(value: BigNumberish): BigNumber;
    export const ConstantNegativeOne: BigNumber;
    export const ConstantZero: BigNumber;
    export const ConstantOne: BigNumber;
    export const ConstantTwo: BigNumber;
    export const ConstantWeiPerEther: BigNumber;
}
declare module "utils/rlp" {
    import { Arrayish } from "utils/bytes";
    export function encode(object: any): string;
    export function decode(data: Arrayish): any;
}
declare module "utils/address" {
    import { BigNumber } from "utils/bignumber";
    import { Arrayish } from "utils/bytes";
    export function getAddress(address: string): string;
    export function getIcapAddress(address: string): string;
    export function getContractAddress(transaction: {
        from: string;
        nonce: Arrayish | BigNumber | number;
    }): string;
}
declare module "utils/utf8" {
    import { Arrayish } from "utils/bytes";
    export enum UnicodeNormalizationForm {
        current = "",
        NFC = "NFC",
        NFD = "NFD",
        NFKC = "NFKC",
        NFKD = "NFKD"
    }
    export function toUtf8Bytes(str: string, form?: UnicodeNormalizationForm): Uint8Array;
    export function toUtf8String(bytes: Arrayish): string;
}
declare module "utils/abi-coder" {
    import { Arrayish } from "utils/bytes";
    export type CoerceFunc = (type: string, value: any) => any;
    export type ParamType = {
        name?: string;
        type: string;
        indexed?: boolean;
        components?: Array<any>;
    };
    export const defaultCoerceFunc: CoerceFunc;
    export type EventFragment = {
        type: string;
        name: string;
        anonymous: boolean;
        inputs: Array<ParamType>;
    };
    export type FunctionFragment = {
        type: string;
        name: string;
        constant: boolean;
        inputs: Array<ParamType>;
        outputs: Array<ParamType>;
        payable: boolean;
        stateMutability: string;
    };
    export function parseParamType(type: string): ParamType;
    export function parseSignature(fragment: string): EventFragment | FunctionFragment;
    export class AbiCoder {
        readonly coerceFunc: CoerceFunc;
        constructor(coerceFunc?: CoerceFunc);
        encode(types: Array<string | ParamType>, values: Array<any>): string;
        decode(types: Array<string | ParamType>, data: Arrayish): any;
    }
    export const defaultAbiCoder: AbiCoder;
}
declare module "contracts/interface" {
    import { ParamType } from "utils/abi-coder";
    import { BigNumber, BigNumberish } from "utils/bignumber";
    export class Description {
        readonly type: string;
        constructor(info: any);
    }
    export class Indexed extends Description {
        readonly hash: string;
    }
    export class DeployDescription extends Description {
        readonly inputs: Array<ParamType>;
        readonly payable: boolean;
        encode(bytecode: string, params: Array<any>): string;
    }
    export class FunctionDescription extends Description {
        readonly name: string;
        readonly signature: string;
        readonly sighash: string;
        readonly inputs: Array<ParamType>;
        readonly outputs: Array<ParamType>;
        readonly payable: boolean;
        encode(params: Array<any>): string;
        decode(data: string): any;
    }
    export class EventDescription extends Description {
        readonly name: string;
        readonly signature: string;
        readonly inputs: Array<ParamType>;
        readonly anonymous: boolean;
        readonly topic: string;
        decode(data: string, topics?: Array<string>): any;
    }
    class TransactionDescription extends Description {
        readonly name: string;
        readonly args: Array<any>;
        readonly signature: string;
        readonly sighash: string;
        readonly decode: (data: string) => any;
        readonly value: BigNumber;
    }
    class LogDescription extends Description {
        readonly name: string;
        readonly signature: string;
        readonly topic: string;
        readonly values: Array<any>;
    }
    export class Interface {
        readonly abi: Array<any>;
        readonly functions: Array<FunctionDescription>;
        readonly events: Array<EventDescription>;
        readonly deployFunction: DeployDescription;
        constructor(abi: Array<string | ParamType> | string);
        parseTransaction(tx: {
            data: string;
            value?: BigNumberish;
        }): TransactionDescription;
        parseLog(log: {
            topics: Array<string>;
            data: string;
        }): LogDescription;
    }
}
declare module "wordlists/wordlist" {
    export abstract class Wordlist {
        locale: string;
        constructor(locale: string);
        abstract getWord(index: number): string;
        abstract getWordIndex(word: string): number;
        split(mnemonic: string): Array<string>;
        join(words: Array<string>): string;
    }
    export function register(lang: any): void;
}
declare module "wordlists/lang-en" {
    import { Wordlist } from "wordlists/wordlist";
    class LangEn extends Wordlist {
        constructor();
        getWord(index: number): string;
        getWordIndex(word: string): number;
    }
    const langEn: LangEn;
    export { langEn };
}
declare module "utils/pbkdf2" {
    import { Arrayish } from "utils/bytes";
    export function pbkdf2(password: Arrayish, salt: Arrayish, iterations: number, keylen: number, hashAlgorithm: string): Uint8Array;
}
declare module "utils/hmac" {
    import { Arrayish } from "utils/bytes";
    export function computeHmac(algorithm: string, key: Arrayish, data: Arrayish): Uint8Array;
}
declare module "utils/sha2" {
    import { Arrayish } from "utils/bytes";
    export function sha256(data: Arrayish): string;
    export function sha512(data: Arrayish): string;
}
declare module "wallet/hdnode" {
    import { Wordlist } from "wordlists/wordlist";
    import { Arrayish } from "utils/bytes";
    export const defaultPath = "m/44'/60'/0'/0/0";
    export class HDNode {
        private readonly keyPair;
        readonly privateKey: string;
        readonly publicKey: string;
        readonly mnemonic: string;
        readonly path: string;
        readonly chainCode: string;
        readonly index: number;
        readonly depth: number;
        /**
         *  This constructor should not be called directly.
         *
         *  Please use:
         *   - fromMnemonic
         *   - fromSeed
         */
        constructor(privateKey: Arrayish, chainCode: Uint8Array, index: number, depth: number, mnemonic: string, path: string);
        private _derive;
        derivePath(path: string): HDNode;
    }
    export function fromMnemonic(mnemonic: string, wordlist?: Wordlist): HDNode;
    export function fromSeed(seed: Arrayish): HDNode;
    export function mnemonicToSeed(mnemonic: string, password?: string): string;
    export function mnemonicToEntropy(mnemonic: string, wordlist?: Wordlist): string;
    export function entropyToMnemonic(entropy: Arrayish, wordlist?: Wordlist): string;
    export function isValidMnemonic(mnemonic: string, wordlist?: Wordlist): boolean;
}
declare module "utils/random-bytes" {
    export function randomBytes(length: number): Uint8Array;
}
declare module "wallet/signing-key" {
    import { Arrayish } from "utils/bytes";
    import { HDNode } from "wallet/hdnode";
    import { Signature } from "utils/secp256k1";
    export class SigningKey {
        readonly privateKey: string;
        readonly publicKey: string;
        readonly address: string;
        readonly mnemonic: string;
        readonly path: string;
        private readonly keyPair;
        constructor(privateKey: Arrayish | HDNode);
        signDigest(digest: Arrayish): Signature;
    }
    export function recoverAddress(digest: Arrayish, signature: Signature): string;
    export function computeAddress(key: string): string;
}
declare module "wallet/secret-storage" {
    import { Arrayish } from "utils/bytes";
    import { SigningKey } from "wallet/signing-key";
    export interface ProgressCallback {
        (percent: number): void;
    }
    export function isCrowdsaleWallet(json: string): boolean;
    export function isValidWallet(json: string): boolean;
    export function decryptCrowdsale(json: string, password: Arrayish | string): SigningKey;
    export function decrypt(json: string, password: any, progressCallback?: ProgressCallback): Promise<SigningKey>;
    export function encrypt(privateKey: Arrayish | SigningKey, password: Arrayish | string, options?: any, progressCallback?: ProgressCallback): Promise<string>;
}
declare module "utils/hash" {
    import { Arrayish } from "utils/bytes";
    export function namehash(name: string): string;
    export function id(text: string): string;
    export function hashMessage(message: Arrayish | string): string;
}
declare module "utils/transaction" {
    import { BigNumber, BigNumberish } from "utils/bignumber";
    import { Arrayish } from "utils/bytes";
    import { Signature } from "utils/secp256k1";
    export type UnsignedTransaction = {
        to?: string;
        nonce?: number;
        gasLimit?: BigNumberish;
        gasPrice?: BigNumberish;
        data?: Arrayish;
        value?: BigNumberish;
        chainId?: number;
    };
    export interface Transaction {
        hash?: string;
        to?: string;
        from?: string;
        nonce: number;
        gasLimit: BigNumber;
        gasPrice: BigNumber;
        data: string;
        value: BigNumber;
        chainId: number;
        r?: string;
        s?: string;
        v?: number;
    }
    export type SignDigestFunc = (digest: Arrayish) => Signature;
    export function sign(transaction: UnsignedTransaction, signDigest: SignDigestFunc): string;
    export function parse(rawTransaction: Arrayish): Transaction;
}
declare module "wallet/wallet" {
    import { HDNode } from "wallet/hdnode";
    import { ProgressCallback } from "wallet/secret-storage";
    import { SigningKey } from "wallet/signing-key";
    import { BlockTag, Provider, TransactionRequest, TransactionResponse } from "providers/provider";
    import { Wordlist } from "wordlists/wordlist";
    import { BigNumber, BigNumberish } from "utils/bignumber";
    import { Arrayish } from "utils/bytes";
    export abstract class Signer {
        provider?: Provider;
        abstract getAddress(): Promise<string>;
        abstract signMessage(transaction: Arrayish | string): Promise<string>;
        abstract sendTransaction(transaction: TransactionRequest): Promise<TransactionResponse>;
    }
    export class Wallet extends Signer {
        readonly provider: Provider;
        private readonly signingKey;
        constructor(privateKey: SigningKey | HDNode | Arrayish, provider?: Provider);
        readonly address: string;
        readonly mnemonic: string;
        readonly path: string;
        readonly privateKey: string;
        /**
         *  Create a new instance of this Wallet connected to provider.
         */
        connect(provider: Provider): Wallet;
        getAddress(): Promise<string>;
        sign(transaction: TransactionRequest): Promise<string>;
        signMessage(message: Arrayish | string): Promise<string>;
        getBalance(blockTag?: BlockTag): Promise<BigNumber>;
        getTransactionCount(blockTag?: BlockTag): Promise<number>;
        sendTransaction(transaction: TransactionRequest): Promise<TransactionResponse>;
        send(addressOrName: string, amountWei: BigNumberish, options: any): Promise<TransactionResponse>;
        encrypt(password: Arrayish | string, options: any, progressCallback: ProgressCallback): Promise<string>;
        /**
         *  Static methods to create Wallet instances.
         */
        static createRandom(options: any): Wallet;
        static fromEncryptedWallet(json: string, password: Arrayish, progressCallback: ProgressCallback): Promise<Wallet>;
        static fromMnemonic(mnemonic: string, path?: string, wordlist?: Wordlist): Wallet;
        static fromBrainWallet(username: Arrayish | string, password: Arrayish | string, progressCallback: ProgressCallback): Promise<Wallet>;
        /**
         *  Determine if this is an encryped JSON wallet.
         */
        static isEncryptedWallet(json: string): boolean;
        /**
         *  Verify a signed message, returning the address of the signer.
         */
        static verifyMessage(message: Arrayish | string, signature: string): string;
    }
}
declare module "providers/networks" {
    export type Network = {
        name: string;
        chainId: number;
        ensAddress?: string;
    };
    export type Networkish = Network | string | number;
    /**
     *  getNetwork
     *
     *  Converts a named common networks or chain ID (network ID) to a Network
     *  and verifies a network is a valid Network..
     */
    export function getNetwork(network: Networkish): Network;
}
declare module "providers/provider" {
    import { Signer } from "wallet/wallet";
    import { BigNumber, BigNumberish } from "utils/bignumber";
    import { Arrayish } from "utils/bytes";
    import { Network, Networkish } from "providers/networks";
    import { SignDigestFunc, Transaction } from "utils/transaction";
    export type BlockTag = string | number;
    export interface Block {
        hash: string;
        parentHash: string;
        number: number;
        timestamp: number;
        nonce: string;
        difficulty: number;
        gasLimit: BigNumber;
        gasUsed: BigNumber;
        miner: string;
        extraData: string;
        transactions: Array<string>;
    }
    export type TransactionRequest = {
        to?: string | Promise<string>;
        from?: string | Promise<string>;
        nonce?: number | string | Promise<number | string>;
        gasLimit?: BigNumberish | Promise<BigNumberish>;
        gasPrice?: BigNumberish | Promise<BigNumberish>;
        data?: Arrayish | Promise<Arrayish>;
        value?: BigNumberish | Promise<BigNumberish>;
        chainId?: number | Promise<number>;
    };
    export interface TransactionResponse extends Transaction {
        blockNumber?: number;
        blockHash?: string;
        timestamp?: number;
        from: string;
        wait: (timeout?: number) => Promise<TransactionResponse>;
    }
    export interface TransactionReceipt {
        contractAddress?: string;
        transactionIndex?: number;
        root?: string;
        gasUsed?: BigNumber;
        logsBloom?: string;
        blockHash?: string;
        transactionHash?: string;
        logs?: Array<Log>;
        blockNumber?: number;
        cumulativeGasUsed?: BigNumber;
        status?: number;
    }
    export type Filter = {
        fromBlock?: BlockTag;
        toBlock?: BlockTag;
        address?: string;
        topics?: Array<any>;
    };
    export interface Log {
        blockNumber?: number;
        blockHash?: string;
        transactionIndex?: number;
        removed?: boolean;
        address: string;
        data?: string;
        topics?: Array<string>;
        transactionHash?: string;
        logIndex?: number;
    }
    export function checkTransactionResponse(transaction: any): TransactionResponse;
    export class ProviderSigner extends Signer {
        readonly provider: Provider;
        readonly signDigest: SignDigestFunc;
        private _addressPromise;
        constructor(address: string | Promise<string>, signDigest: SignDigestFunc, provider: Provider);
        getAddress(): Promise<string>;
        signMessage(message: Arrayish | string): Promise<string>;
        sendTransaction(transaction: TransactionRequest): Promise<TransactionResponse>;
    }
    export class Provider {
        private _network;
        private _events;
        protected _emitted: any;
        private _pollingInterval;
        private _poller;
        private _lastBlockNumber;
        private _balances;
        /**
         *  ready
         *
         *  A Promise<Network> that resolves only once the provider is ready.
         *
         *  Sub-classes that call the super with a network without a chainId
         *  MUST set this. Standard named networks have a known chainId.
         *
         */
        protected ready: Promise<Network>;
        constructor(network: Networkish | Promise<Network>);
        private _doPoll;
        resetEventsBlock(blockNumber: number): void;
        readonly network: Network;
        getNetwork(): Promise<Network>;
        readonly blockNumber: number;
        polling: boolean;
        pollingInterval: number;
        waitForTransaction(transactionHash: string, timeout?: number): Promise<TransactionResponse>;
        getBlockNumber(): Promise<number>;
        getGasPrice(): Promise<BigNumber>;
        getBalance(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<BigNumber>;
        getTransactionCount(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<number>;
        getCode(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<string>;
        getStorageAt(addressOrName: string | Promise<string>, position: BigNumberish | Promise<BigNumberish>, blockTag?: BlockTag | Promise<BlockTag>): Promise<string>;
        sendTransaction(signedTransaction: string | Promise<string>): Promise<TransactionResponse>;
        call(transaction: TransactionRequest): Promise<string>;
        estimateGas(transaction: TransactionRequest): Promise<BigNumber>;
        getBlock(blockHashOrBlockTag: BlockTag | string | Promise<BlockTag | string>): Promise<Block>;
        getTransaction(transactionHash: string): Promise<TransactionResponse>;
        getTransactionReceipt(transactionHash: string): Promise<TransactionReceipt>;
        getLogs(filter: Filter): Promise<Array<Log>>;
        getEtherPrice(): Promise<number>;
        _resolveNames(object: any, keys: Array<string>): Promise<any>;
        _getResolver(name: string): Promise<string>;
        resolveName(name: string | Promise<string>): Promise<string>;
        lookupAddress(address: string | Promise<string>): Promise<string>;
        doPoll(): void;
        perform(method: string, params: any): Promise<any>;
        _startPending(): void;
        _stopPending(): void;
        on(eventName: any, listener: any): Provider;
        once(eventName: any, listener: any): Provider;
        emit(eventName: any, ...args: any[]): boolean;
        listenerCount(eventName?: any): number;
        listeners(eventName: any): Array<any>;
        removeAllListeners(eventName: any): Provider;
        removeListener(eventName: any, listener: any): Provider;
    }
}
declare module "contracts/contract" {
    import { Interface } from "contracts/interface";
    import { Provider, TransactionResponse } from "providers/provider";
    import { Signer } from "wallet/wallet";
    import { ParamType } from "utils/abi-coder";
    import { BigNumber } from "utils/bignumber";
    export type ContractEstimate = (...params: Array<any>) => Promise<BigNumber>;
    export type ContractFunction = (...params: Array<any>) => Promise<any>;
    export type ContractEvent = (...params: Array<any>) => void;
    interface Bucket<T> {
        [name: string]: T;
    }
    export type Contractish = Array<string | ParamType> | Interface | string;
    export class Contract {
        readonly address: string;
        readonly interface: Interface;
        readonly signer: Signer;
        readonly provider: Provider;
        readonly estimate: Bucket<ContractEstimate>;
        readonly functions: Bucket<ContractFunction>;
        readonly events: Bucket<ContractEvent>;
        readonly addressPromise: Promise<string>;
        readonly deployTransaction: TransactionResponse;
        constructor(addressOrName: string, contractInterface: Contractish, signerOrProvider: Signer | Provider);
        connect(signerOrProvider: Signer | Provider): Contract;
        deploy(bytecode: string, ...args: Array<any>): Promise<Contract>;
    }
}
declare module "contracts/index" {
    import { Contract } from "contracts/contract";
    import { Interface } from "contracts/interface";
    export { Contract, Interface };
}
declare module "utils/base64" {
    import { Arrayish } from "utils/bytes";
    export function decode(textData: string): Uint8Array;
    export function encode(data: Arrayish): string;
}
declare module "utils/web" {
    export type ConnectionInfo = {
        url: string;
        user?: string;
        password?: string;
        allowInsecure?: boolean;
    };
    export type ProcessFunc = (value: any) => any;
    export function fetchJson(url: string | ConnectionInfo, json: string, processFunc: ProcessFunc): Promise<any>;
}
declare module "providers/etherscan-provider" {
    import { BlockTag, Provider, TransactionResponse } from "providers/provider";
    import { Networkish } from "providers/networks";
    export class EtherscanProvider extends Provider {
        readonly baseUrl: string;
        readonly apiKey: string;
        constructor(network?: Networkish, apiKey?: string);
        perform(method: string, params: any): Promise<any>;
        getHistory(addressOrName: string | Promise<string>, startBlock?: BlockTag, endBlock?: BlockTag): Promise<Array<TransactionResponse>>;
    }
}
declare module "providers/fallback-provider" {
    import { Provider } from "providers/provider";
    export class FallbackProvider extends Provider {
        private _providers;
        constructor(providers: Array<Provider>);
        readonly providers: Array<Provider>;
        perform(method: string, params: any): any;
    }
}
declare module "providers/json-rpc-provider" {
    import { Networkish } from "providers/networks";
    import { BlockTag, Provider, TransactionRequest, TransactionResponse } from "providers/provider";
    import { Signer } from "wallet/wallet";
    import { BigNumber } from "utils/bignumber";
    import { Arrayish } from "utils/bytes";
    import { ConnectionInfo } from "utils/web";
    export function hexlifyTransaction(transaction: TransactionRequest): any;
    export class JsonRpcSigner extends Signer {
        readonly provider: JsonRpcProvider;
        private _address;
        constructor(provider: JsonRpcProvider, address?: string);
        readonly address: string;
        getAddress(): Promise<string>;
        getBalance(blockTag?: BlockTag): Promise<BigNumber>;
        getTransactionCount(blockTag: any): Promise<number>;
        sendTransaction(transaction: TransactionRequest): Promise<TransactionResponse>;
        signMessage(message: Arrayish | string): Promise<string>;
        unlock(password: any): Promise<boolean>;
    }
    export class JsonRpcProvider extends Provider {
        readonly connection: ConnectionInfo;
        private _pendingFilter;
        constructor(url?: ConnectionInfo | string, network?: Networkish);
        getSigner(address: string): JsonRpcSigner;
        listAccounts(): Promise<Array<string>>;
        send(method: string, params: any): Promise<any>;
        perform(method: string, params: any): Promise<any>;
        _startPending(): void;
        _stopPending(): void;
    }
}
declare module "providers/ipc-provider" {
    import { JsonRpcProvider } from "providers/json-rpc-provider";
    import { Networkish } from "providers/networks";
    export class IpcProvider extends JsonRpcProvider {
        readonly path: string;
        constructor(path: string, network?: Networkish);
        send(method: string, params: any): Promise<any>;
    }
}
declare module "providers/infura-provider" {
    import { JsonRpcProvider, JsonRpcSigner } from "providers/json-rpc-provider";
    import { Networkish } from "providers/networks";
    export class InfuraProvider extends JsonRpcProvider {
        readonly apiAccessToken: string;
        constructor(network?: Networkish, apiAccessToken?: string);
        _startPending(): void;
        getSigner(address?: string): JsonRpcSigner;
        listAccounts(): Promise<Array<string>>;
    }
}
declare module "providers/web3-provider" {
    import { Networkish } from "providers/networks";
    import { JsonRpcProvider } from "providers/json-rpc-provider";
    export type Callback = (error: any, response: any) => void;
    export type AsyncProvider = {
        isMetaMask: boolean;
        host?: string;
        path?: string;
        sendAsync: (request: any, callback: Callback) => void;
    };
    export class Web3Provider extends JsonRpcProvider {
        readonly _web3Provider: AsyncProvider;
        constructor(web3Provider: AsyncProvider, network?: Networkish);
        send(method: string, params: any): Promise<any>;
    }
}
declare module "providers/index" {
    import { Provider, ProviderSigner } from "providers/provider";
    import { Network } from "providers/networks";
    import { EtherscanProvider } from "providers/etherscan-provider";
    import { FallbackProvider } from "providers/fallback-provider";
    import { IpcProvider } from "providers/ipc-provider";
    import { InfuraProvider } from "providers/infura-provider";
    import { JsonRpcProvider } from "providers/json-rpc-provider";
    import { Web3Provider } from "providers/web3-provider";
    function getDefaultProvider(network?: Network | string): FallbackProvider;
    export { Provider, getDefaultProvider, ProviderSigner, FallbackProvider, EtherscanProvider, InfuraProvider, JsonRpcProvider, Web3Provider, IpcProvider };
}
declare module "utils/solidity" {
    export function pack(types: Array<string>, values: Array<any>): string;
    export function keccak256(types: Array<string>, values: Array<any>): string;
    export function sha256(types: Array<string>, values: Array<any>): string;
}
declare module "utils/units" {
    import { BigNumber, BigNumberish } from "utils/bignumber";
    export function formatUnits(value: BigNumberish, unitType?: string | number, options?: any): string;
    export function parseUnits(value: string, unitType?: string | number): BigNumber;
    export function formatEther(wei: BigNumberish, options: any): string;
    export function parseEther(ether: string): BigNumber;
}
declare module "utils/index" {
    import { getAddress, getContractAddress, getIcapAddress } from "utils/address";
    import { AbiCoder, defaultAbiCoder, parseSignature, parseParamType } from "utils/abi-coder";
    import * as base64 from "utils/base64";
    import { BigNumber, bigNumberify } from "utils/bignumber";
    import { arrayify, concat, hexlify, joinSignature, padZeros, splitSignature, stripZeros } from "utils/bytes";
    import { hashMessage, id, namehash } from "utils/hash";
    import { keccak256 } from "utils/keccak256";
    import { sha256 } from "utils/sha2";
    import { keccak256 as solidityKeccak256, pack as solidityPack, sha256 as soliditySha256 } from "utils/solidity";
    import { randomBytes } from "utils/random-bytes";
    import { defineFrozen, defineReadOnly, resolveProperties, shallowCopy } from "utils/properties";
    import * as RLP from "utils/rlp";
    import { toUtf8Bytes, toUtf8String } from "utils/utf8";
    import { formatEther, parseEther, formatUnits, parseUnits } from "utils/units";
    import { fetchJson } from "utils/web";
    import { parse as parseTransaction } from "utils/transaction";
    import * as errors from "utils/errors";
    const etherSymbol = "\u039E";
    export { AbiCoder, defaultAbiCoder, parseSignature, parseParamType, RLP, fetchJson, defineReadOnly, defineFrozen, resolveProperties, shallowCopy, etherSymbol, arrayify, concat, padZeros, stripZeros, base64, bigNumberify, BigNumber, hexlify, toUtf8Bytes, toUtf8String, hashMessage, namehash, id, getAddress, getIcapAddress, getContractAddress, formatEther, parseEther, formatUnits, parseUnits, keccak256, sha256, randomBytes, solidityPack, solidityKeccak256, soliditySha256, splitSignature, joinSignature, parseTransaction, errors };
}
declare module "wallet/index" {
    import { Wallet } from "wallet/wallet";
    import * as HDNode from "wallet/hdnode";
    import { SigningKey } from "wallet/signing-key";
    export { HDNode, SigningKey, Wallet };
}
declare module "index" {
    import { Contract, Interface } from "contracts/index";
    import * as providers from "providers/index";
    import * as errors from "utils/errors";
    import { getNetwork } from "providers/networks";
    import * as utils from "utils/index";
    import { HDNode, SigningKey, Wallet } from "wallet/index";
    const version = "4.0.0";
    export { Wallet, HDNode, SigningKey, Contract, Interface, getNetwork, providers, errors, utils, version };
}
declare module "wordlists/lang-it" {
    import { Wordlist } from "wordlists/wordlist";
    class LangIt extends Wordlist {
        constructor();
        getWord(index: number): string;
        getWordIndex(word: string): number;
    }
    const langIt: LangIt;
    export { langIt };
}
declare module "wordlists/lang-ja" {
    import { Wordlist } from "wordlists/wordlist";
    class LangJa extends Wordlist {
        constructor();
        getWord(index: any): string;
        getWordIndex(word: any): number;
        split(mnemonic: string): Array<string>;
        join(words: Array<string>): string;
    }
    const langJa: LangJa;
    export { langJa };
}
declare module "wordlists/lang-ko" {
    import { Wordlist } from "wordlists/wordlist";
    class LangKo extends Wordlist {
        constructor();
        getWord(index: number): string;
        getWordIndex(word: string): number;
    }
    const langKo: LangKo;
    export { langKo };
}
declare module "wordlists/lang-zh" {
    import { Wordlist } from "wordlists/wordlist";
    class LangZh extends Wordlist {
        private _country;
        constructor(country: any);
        getWord(index: number): string;
        getWordIndex(word: string): number;
        split(mnemonic: string): Array<string>;
    }
    const langZhCn: LangZh;
    const langZhTw: LangZh;
    export { langZhCn, langZhTw };
}
//# sourceMappingURL=ethers.d.ts.map