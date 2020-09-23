/// <reference types="node" />
import { Server } from "http";
export declare function getMime(filename: string): string;
export declare type Options = {
    port?: number;
    redirects?: Record<string, string>;
};
export declare function start(root: string, options: Options): Server;
