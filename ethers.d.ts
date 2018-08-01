import { Contract, Interface } from './contracts';
import { Provider, getDefaultProvider, FallbackProvider, EtherscanProvider, InfuraProvider, JsonRpcProvider, Web3Provider, IpcProvider } from './providers';
import { JsonRpcSigner } from './providers/json-rpc-provider';
import { HDNode, SigningKey, Wallet } from './wallet';
import * as utils from './utils';
import * as wordlists from './wordlists';
import * as errors from './utils/errors';
import { platform } from './utils/shims';
import { version } from './_version';
import { Provider as _AbstractProvider } from './providers/abstract-provider';
import { Signer as _AbstractSigner } from './wallet/abstract-signer';
import { ContractFunction as _ContractFunction, Event as _Event, EventFilter as _EventFilter } from './contracts/contract';
import { Indexed as _Indexed, DeployDescription as _DeplyDescription, EventDescription as _EventDescription, FunctionDescription as _FunctionDescription, LogDescription as _LogDescription, TransactionDescription as _TransactionDescription } from './contracts/interface';
import { Block as _Block, BlockTag as _BlockTag, EventType as _EventType, Filter as _Filter, Log as _Log, Listener as _Listener, TransactionReceipt as _TransactionReceipt, TransactionRequest as _TransactionRequest, TransactionResponse as _TransactionResponse } from './providers/abstract-provider';
import { AsyncSendable as _AsyncSendable } from './providers/web3-provider';
import { CoerceFunc as _CoerceFunc, EventFragment as _EventFragment, FunctionFragment as _FunctionFragment, ParamType as _ParamType } from './utils/abi-coder';
import { BigNumberish as _BigNumberish } from './utils/bignumber';
import { Arrayish as _Arrayish, Hexable as _Hexable, Signature as _Signature } from './utils/bytes';
import { SupportedAlgorithms as _SupportedAlgorithms } from './utils/hmac';
import { Network as _Network, Networkish as _Networkish } from './utils/networks';
import { Transaction as _Transaction, UnsignedTransaction as _UnsignedTransaction } from './utils/transaction';
import { UnicodeNormalizationForm as _UnicodeNotmalizationForm } from './utils/utf8';
import { ConnectionInfo as _ConnectionInfo, OnceBlockable as _OnceBlockable, PollOptions as _PollOptions } from './utils/web';
import { EncryptOptions as _EncryptOptions, ProgressCallback as _ProgressCallback } from './wallet/secret-storage';
import { Wordlist as _Wordlist } from './wordlists/wordlist';
declare module types {
    const AbstractSigner: typeof _AbstractSigner;
    const AbstractProvider: typeof _AbstractProvider;
    type SignerOrProvider = _AbstractSigner | _AbstractProvider;
    type ContractFunction = _ContractFunction;
    type EventFilter = _EventFilter;
    interface Event extends _Event {
    }
    interface Indexed extends _Indexed {
    }
    interface DeployDescription extends _DeplyDescription {
    }
    interface EventDescription extends _EventDescription {
    }
    interface FunctionDescription extends _FunctionDescription {
    }
    interface LogDescription extends _LogDescription {
    }
    interface TransactionDescription extends _TransactionDescription {
    }
    type BlockTag = _BlockTag;
    type EventType = _EventType;
    type Filter = _Filter;
    type Listener = _Listener;
    type TransactionRequest = _TransactionRequest;
    interface Block extends _Block {
    }
    interface Log extends _Log {
    }
    interface TransactionReceipt extends _TransactionReceipt {
    }
    interface TransactionResponse extends _TransactionResponse {
    }
    type AsyncSendable = _AsyncSendable;
    type CoerceFunc = _CoerceFunc;
    type EventFragment = _EventFragment;
    type FunctionFragment = _FunctionFragment;
    type ParamType = _ParamType;
    type BigNumberish = _BigNumberish;
    type Arrayish = _Arrayish;
    type Hexable = _Hexable;
    type Signature = _Signature;
    const SupportedAlgorithms: typeof _SupportedAlgorithms;
    type Network = _Network;
    type Networkish = _Networkish;
    type UnsignedTransaction = _UnsignedTransaction;
    interface Transaction extends _Transaction {
    }
    const UnicodeNormalizationForm: typeof _UnicodeNotmalizationForm;
    type ConnectionInfo = _ConnectionInfo;
    interface OnceBlockable extends _OnceBlockable {
    }
    type PollOptions = _PollOptions;
    type EncryptOptions = _EncryptOptions;
    type ProgressCallback = _ProgressCallback;
    const Wordlist: typeof _Wordlist;
}
declare const constants: {
    AddressZero: string;
    HashZero: string;
    NegativeOne: utils.BigNumber;
    Zero: utils.BigNumber;
    One: utils.BigNumber;
    Two: utils.BigNumber;
    WeiPerEther: utils.BigNumber;
    MaxUint256: utils.BigNumber;
};
declare const providers: {
    Provider: typeof Provider;
    FallbackProvider: typeof FallbackProvider;
    EtherscanProvider: typeof EtherscanProvider;
    InfuraProvider: typeof InfuraProvider;
    IpcProvider: typeof IpcProvider;
    JsonRpcProvider: typeof JsonRpcProvider;
    Web3Provider: typeof Web3Provider;
    JsonRpcSigner: typeof JsonRpcSigner;
};
export { Wallet, HDNode, SigningKey, Contract, Interface, getDefaultProvider, providers, errors, constants, utils, types, wordlists, platform, version };
