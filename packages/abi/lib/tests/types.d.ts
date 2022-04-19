export declare type TestCaseAbiVerbose = {
    type: "address" | "hexstring" | "number" | "string";
    value: string;
} | {
    type: "boolean";
    value: boolean;
} | {
    type: "array";
    value: Array<TestCaseAbiVerbose>;
} | {
    type: "object";
    value: Array<TestCaseAbiVerbose>;
};
export interface TestCaseAbi {
    name: string;
    type: string;
    value: any;
    verbose: TestCaseAbiVerbose;
    bytecode: string;
    encoded: string;
}
//# sourceMappingURL=types.d.ts.map