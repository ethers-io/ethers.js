interface Runner {
    on(event: string, callback: (...args: Array<any>) => void): Runner;
}
export declare type LogFunc = (message: string) => void;
export declare function setLogFunc(logFunc: LogFunc): void;
export declare function Reporter(runner: Runner): void;
export {};
//# sourceMappingURL=reporter.d.ts.map