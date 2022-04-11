export type NestedHexString = string | Array<string | NestedHexString>;

export interface TestCaseRlp {
    name: string;
    encoded: string;
    decoded: NestedHexString;
}
