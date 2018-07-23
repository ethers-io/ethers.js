import { ConnectionInfo, PollOptions } from './types';
export declare function fetchJson(connection: string | ConnectionInfo, json: string, processFunc: (value: any) => any): Promise<any>;
export declare function poll(func: () => Promise<any>, options?: PollOptions): Promise<any>;
//# sourceMappingURL=web.d.ts.map