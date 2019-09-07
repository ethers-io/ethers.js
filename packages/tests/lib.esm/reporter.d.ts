interface Runner {
    on(event: string, callback: (...args: Array<any>) => void): Runner;
}
export declare function Reporter(runner: Runner): void;
export {};
