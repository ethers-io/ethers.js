
export interface TestCaseAccount {
    name: string;
    privateKey: string;
    address: string;
    icap: string;
}

export type TestCaseCreate = {
    sender: string;
    creates: Array<{
        name: string,
        nonce: number,
        address: string
    }>;
};

export type TestCaseCreate2 = {
    sender: string;
    creates: Array<{
        name: string,
        salt: string;
        initCode: string
        initCodeHash: string
        address: string;
    }>;
};
