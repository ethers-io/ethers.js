export type TestCaseBadString = {
    name: string;
    bytes: Uint8Array;
    ignore: string;
    replace: string;
    error: string;
};
export type TestCaseCodePoints = {
    name: string;
    text: string;
    codepoints: Array<number>;
};
