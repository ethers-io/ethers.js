type Bytes<N extends number = number> = globalThis.Uint8Array & {
    length: N;
};

interface IClock {
    now(): number;
    delay(ms: number): Promise<void>;
    delayUnref(ms: number): Promise<void>;
    setTimeout(callback: () => void, delay: number): unknown;
    clearTimeout(timerId: unknown): void;
    setInterval(callback: () => void, interval: number): unknown;
    clearInterval(timerId: unknown): void;
    unref(timerId: unknown): void;
    ref(timerId: unknown): void;
}

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogConstructorParams$1 {
    clock?: IClock;
    rawLog?: (level: LogLevel, ...args: unknown[]) => void;
    parentStartTime?: number;
    namePrefix?: string;
}
/**
 * A hierarchical logging system with timestamps relative to root logger creation.
 *
 * Usage:
 * ```typescript
 * const log = new Log();
 * log.debug("Hello");                    // [00.000] Hello
 * log.warn("Something", { data: 123 }); // [00.123] Something { data: 123 }
 *
 * const child = log.child("mymodule");
 * child.error("Error!");                 // [00.456] [mymodule] Error!
 *
 * const grandchild = child.child("component");
 * grandchild.info("Info");               // [00.789] [mymodule.component] Info
 * ```
 */
declare class Log {
    private clock;
    private rawLog;
    private parentStartTime;
    private namePrefix;
    constructor(params?: LogConstructorParams$1);
    /**
     * Create a child logger with a prefixed name.
     * Multiple calls to child() create new instances (not memoized).
     */
    child(name: string): Log;
    debug(...args: unknown[]): void;
    info(...args: unknown[]): void;
    warn(...args: unknown[]): void;
    error(...args: unknown[]): void;
    private log;
    /**
     * Format elapsed milliseconds as a relative timestamp.
     *
     * Format depends on elapsed time:
     * - SS.mmm (seconds) e.g., "07.138"
     * - MM:SS.mmm (minutes) e.g., "05:07.138"
     * - HH:MM:SS.mmm (hours) e.g., "01:05:07.138"
     * - Xd HH:MM:SS.mmm (days) e.g., "3d 01:05:07.138"
     */
    private formatTimestamp;
    private defaultRawLog;
    private getConsoleMethod;
}

type IStorage = {
    read: (key: string) => Promise<Bytes>;
    write: (key: string, value: Bytes) => Promise<void>;
    list: (keyPrefix: string) => Promise<string[]>;
    remove: (key: string) => Promise<void>;
    removeAll: (keyPrefix?: string) => Promise<void>;
};

declare class MemoryStorage implements IStorage {
    private data;
    read(key: string): Promise<Bytes>;
    write(key: string, value: Bytes): Promise<void>;
    list(keyPrefix: string): Promise<string[]>;
    remove(key: string): Promise<void>;
    removeAll(keyPrefix?: string): Promise<void>;
}

declare class IndexedDBStorage implements IStorage {
    private dbName;
    private storeName;
    private dbPromise;
    constructor(name: string);
    private getDB;
    read(key: string): Promise<Bytes>;
    write(key: string, value: Bytes): Promise<void>;
    list(keyPrefix: string): Promise<string[]>;
    remove(key: string): Promise<void>;
    removeAll(keyPrefix?: string): Promise<void>;
}

declare class FsStorage implements IStorage {
    private dirPath;
    private useTmp;
    private initialized;
    constructor(dirPath: string, useTmp?: boolean);
    /**
     * Create FsStorage in system temp directory.
     * The path will be /tmp/{name}
     */
    static tmp(name: string): FsStorage;
    private ensureDir;
    private getPath;
    read(key: string): Promise<Bytes>;
    write(key: string, value: Bytes): Promise<void>;
    list(keyPrefix: string): Promise<string[]>;
    remove(key: string): Promise<void>;
    removeAll(keyPrefix?: string): Promise<void>;
}

/**
 * Creates an appropriate storage backend for the current environment.
 * In browser environments, uses IndexedDB for persistence.
 * In Node.js environments, uses filesystem storage in the system temp directory/{name}.
 * Throws an error if neither environment can be detected.
 */
declare function createAutoStorage(name: string): IStorage;

type index_FsStorage = FsStorage;
declare const index_FsStorage: typeof FsStorage;
type index_IStorage = IStorage;
type index_IndexedDBStorage = IndexedDBStorage;
declare const index_IndexedDBStorage: typeof IndexedDBStorage;
type index_MemoryStorage = MemoryStorage;
declare const index_MemoryStorage: typeof MemoryStorage;
declare const index_createAutoStorage: typeof createAutoStorage;
declare namespace index {
  export { index_FsStorage as FsStorage, index_IndexedDBStorage as IndexedDBStorage, index_MemoryStorage as MemoryStorage, index_createAutoStorage as createAutoStorage };
  export type { index_IStorage as IStorage };
}

/**
 * Configuration options for the TorClient.
 */
interface TorClientOptions {
    /** The Snowflake bridge WebSocket URL for Tor connections */
    snowflakeUrl: string;
    /** Timeout in milliseconds for establishing initial connections (default: 15000) */
    connectionTimeout?: number;
    /** Timeout in milliseconds for circuit creation and readiness (default: 90000) */
    circuitTimeout?: number;
    /** Number of circuits to pre-create and maintain in buffer (default: 2) */
    circuitBuffer?: number;
    /** Maximum lifetime in milliseconds for circuits before disposal (default: 600000 = 10 minutes) */
    maxCircuitLifetime?: number;
    /** Optional logger instance for hierarchical logging */
    log?: Log;
    /**
     * Optional storage interface for caching (default: tmp dir in nodejs,
     * indexeddb in browser).
     * Use `new storage.MemoryStorage()` to avoid secondary storage and only cache
     * during the current session.
     */
    storage?: IStorage;
}

declare const tor: {
    /**
     * Same as standard fetch, but powered by tor.
     * https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
     */
    fetch(url: string, options?: RequestInit): Promise<Response>;
    /**
     * Configures the TorClient singleton.
     * Closes and restarts if already started.
     */
    configure(customConfig: TorClientOptions): void;
    /**
     * Actively open the TorClient singleton.
     * This is optional - it's automatic if you just call fetch.
     * This library doesn't do anything until it is used, but it's beneficial to
     * call this early if you know you're going to use it.
     */
    open(): void;
    /**
     * Close the singleton.
     */
    close(): void;
};

export { Log, index as storage, tor };
export type { LogLevel, TorClientOptions };
