/*
import { version } from "../_version.js";

import { throwArgumentError } from "./errors.js";


export type LogLevel = "debug" | "info" | "warning" | "error" | "off";

const LogLevels: Array<LogLevel> = [ "debug", "info", "warning", "error", "off" ];


function defineReadOnly<T, P extends keyof T>(object: T, name: P, value: T[P]): void {
    Object.defineProperty(object, name, {
        enumerable: true, writable: false, value,
    });
}

export type AssertFunc<T> = () => (undefined | T);

export class Logger {
    readonly version!: string;

    #logLevel: number;

    constructor(version?: string) {
        defineReadOnly(this, "version", version || "_");
        this.#logLevel = 1;
    }

    get logLevel(): LogLevel {
        return LogLevels[this.#logLevel];
    }

    set logLevel(value: LogLevel) {
        const logLevel = LogLevels.indexOf(value);
        if (logLevel == null) {
            throwArgumentError("invalid logLevel", "logLevel", value);
        }
        this.#logLevel = logLevel;
    }

    #log(_logLevel: LogLevel, args: Array<any>): void {
        const logLevel = LogLevels.indexOf(_logLevel);
        if (logLevel === -1) {
            throwArgumentError("invalid log level name", "logLevel", _logLevel);
        }
        if (this.#logLevel > logLevel) { return; }
        console.log.apply(console, args);
    }

    debug(...args: Array<any>): void {
        this.#log("debug", args);
    }

    info(...args: Array<any>): void {
        this.#log("info", args);
    }

    warn(...args: Array<any>): void {
        this.#log("warning", args);
    }
}

export const logger = new Logger(version);


*/
