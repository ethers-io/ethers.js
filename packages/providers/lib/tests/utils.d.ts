export declare function loadTests<T>(tag: string): Array<T>;
export interface MochaRunnable {
    timeout: (value: number) => void;
    skip: () => void;
}
export declare function retryIt(name: string, func: (this: MochaRunnable) => Promise<void>): Promise<void>;
export interface StatSet {
    name: string;
    retries: Array<{
        message: string;
        error: null | Error;
    }>;
}
export declare class Stats {
    #private;
    constructor(guard: any);
    pushRetry(attempt: number, line: string, error: null | Error): void;
    start(name: string): void;
    end(): void;
}
export declare const stats: Stats;
//# sourceMappingURL=utils.d.ts.map