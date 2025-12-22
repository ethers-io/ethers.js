export var Log: {
    new (params?: {}): {
        clock: any;
        rawLog: any;
        parentStartTime: any;
        namePrefix: any;
        /**
         * Create a child logger with a prefixed name.
         * Multiple calls to child() create new instances (not memoized).
         */
        child(name: any): any;
        debug(...args: any[]): void;
        info(...args: any[]): void;
        warn(...args: any[]): void;
        error(...args: any[]): void;
        log(level: any, ...args: any[]): void;
        /**
         * Format elapsed milliseconds as a relative timestamp.
         *
         * Format depends on elapsed time:
         * - SS.mmm (seconds) e.g., "07.138"
         * - MM:SS.mmm (minutes) e.g., "05:07.138"
         * - HH:MM:SS.mmm (hours) e.g., "01:05:07.138"
         * - Xd HH:MM:SS.mmm (days) e.g., "3d 01:05:07.138"
         */
        formatTimestamp(elapsedMs: any): string;
        defaultRawLog(level: any, ...args: any[]): void;
        getConsoleMethod(level: any): ((message?: any, ...optionalParams: any[]) => void) | undefined;
    };
};
declare var storage_exports: {};
export namespace tor {
    /**
     * Same as standard fetch, but powered by tor.
     * https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
     */
    function fetch(url: any, options: any): Promise<any>;
    /**
     * Configures the TorClient singleton.
     * Closes and restarts if already started.
     */
    function configure(customConfig: any): void;
    /**
     * Actively open the TorClient singleton.
     * This is optional - it's automatic if you just call fetch.
     * This library doesn't do anything until it is used, but it's beneficial to
     * call this early if you know you're going to use it.
     */
    function open(): void;
    /**
     * Close the singleton.
     */
    function close(): void;
}
export { storage_exports as storage };
//# sourceMappingURL=index.d.mts.map