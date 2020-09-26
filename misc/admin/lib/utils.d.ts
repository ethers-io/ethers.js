/// <reference types="node" />
export declare function repeat(char: string, length: number): string;
export declare function sha256(content: Buffer): string;
export declare function sortRecords(record: Record<string, any>): Record<string, any>;
export declare function atomicWrite(path: string, value: string | Uint8Array): void;
export declare function loadJson(path: string): any;
export declare function saveJson(filename: string, data: any, sort?: boolean): any;
export declare function resolveProperties(props: Record<string, Promise<any>>): Promise<Record<string, any>>;
export declare function mkdir(path: string): void;
export declare function getDateTime(date: Date): string;
