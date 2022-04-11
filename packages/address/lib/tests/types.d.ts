export interface TestCaseAccount {
    name: string;
    privateKey: string;
    address: string;
    icap: string;
}
export declare type TestCaseCreate = {
    sender: string;
    creates: Array<{
        name: string;
        nonce: number;
        address: string;
    }>;
};
export declare type TestCaseCreate2 = {
    sender: string;
    creates: Array<{
        name: string;
        salt: string;
        initCode: string;
        initCodeHash: string;
        address: string;
    }>;
};
//# sourceMappingURL=types.d.ts.map