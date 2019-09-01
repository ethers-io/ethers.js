interface Runner {
    on(event: string, callback: (...args: Array<any>) => void): Runner;
}
declare function Reporter(runner: Runner): void;
export = Reporter;
