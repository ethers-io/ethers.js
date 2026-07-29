import { AbstractProvider, Network } from "../index.js";
import type { PerformActionRequest } from "../index.js";
export type Performer = (req: PerformActionRequest) => Promise<any>;
export declare class MockProvider extends AbstractProvider {
    readonly _perform: Performer;
    constructor(perform: Performer);
    _detectNetwork(): Promise<Network>;
    perform(req: PerformActionRequest): Promise<any>;
}
//# sourceMappingURL=test-providers-fallback.d.ts.map