"use strict";

import type { Agent as HTTPAgent } from 'http';
import type { Agent as HTTPSAgent } from 'https';

export interface HttpProviderAgent {
    http?: HTTPAgent;
    https?: HTTPSAgent;
}

export type GetUrlResponse = {
    statusCode: number;
    statusMessage: string;
    headers: { [ key: string] : string };
    body: Uint8Array;
};

export type Options = {
    method?: string;
    allowGzip?: boolean;
    body?: Uint8Array;
    headers?: { [ key: string] : string };
    skipFetchSetup?: boolean;
    agent?: HttpProviderAgent;
};
