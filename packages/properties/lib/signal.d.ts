import type { Numeric } from "@ethersproject/logger";
import type { Listener } from "./events.js";
export declare class Signal {
    #private;
    constructor(_timeout?: Numeric);
    get invalidated(): boolean;
    cancel(): boolean;
    invalidate(): boolean;
    addListener(listener: Listener): this;
    removeListener(listener: Listener): this;
}
//# sourceMappingURL=signal.d.ts.map