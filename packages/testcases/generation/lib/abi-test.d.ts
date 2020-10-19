import { AbstractTest } from "./test";
export interface AbiType {
    name: string;
    type: string;
    struct?: string;
    components?: Array<AbiType>;
    create(): any;
}
export declare abstract class AbstractAbiTest<T = any> extends AbstractTest<T> {
    _nextNames: Record<string, number>;
    constructor(name: string);
    nextName(prefix?: string): string;
    randomType(dynamicOrType?: boolean | string): AbiType;
}
