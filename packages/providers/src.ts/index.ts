"use strict";

import {
    Block,
    BlockTag,
    EventType,
    Filter,
    Log,
    Listener,
    Provider,
    TransactionReceipt,
    TransactionRequest,
    TransactionResponse
} from "@ethersproject/abstract-provider";

import { getNetwork } from "@ethersproject/networks";
import { Network, Networkish } from "@ethersproject/networks";

import { BaseProvider } from "./base-provider";

import { AlchemyProvider } from "./alchemy-provider";
import { CloudflareProvider } from "./cloudflare-provider";
import { EtherscanProvider } from "./etherscan-provider";
import { FallbackProvider } from "./fallback-provider";
import { IpcProvider } from "./ipc-provider";
import { InfuraProvider } from "./infura-provider";
import { JsonRpcProvider, JsonRpcSigner } from "./json-rpc-provider";
import { NodesmithProvider } from "./nodesmith-provider";
import { Web3Provider } from "./web3-provider";

import { AsyncSendable } from "./web3-provider";

import { Formatter } from "./formatter";

////////////////////////
// Exports

export {

    // Abstract Providers (or Abstract-ish)
    Provider,
    BaseProvider,


    ///////////////////////
    // Concreate Providers

    FallbackProvider,

    AlchemyProvider,
    CloudflareProvider,
    EtherscanProvider,
    InfuraProvider,
    JsonRpcProvider,
    NodesmithProvider,
    Web3Provider,

    IpcProvider,


    ///////////////////////
    // Signer

    JsonRpcSigner,


    ///////////////////////
    // Functions

    getNetwork,


    ///////////////////////
    // Objects

    Formatter,


    ///////////////////////
    // Types

    Block,
    BlockTag,
    EventType,
    Filter,
    Log,
    Listener,
    TransactionReceipt,
    TransactionRequest,
    TransactionResponse,

    AsyncSendable,

    Network,
    Networkish
};

