export declare function loadTests<T>(tag: string): Array<T>;
export declare function log(context: any, text: string): void;
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
    end(context?: any): void;
}
export declare const stats: Stats;
//# sourceMappingURL=utils.d.ts.map