"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventPayload = void 0;
/**
 *  Explain events...
 *
 *  @_section api/utils/events:Events  [about-events]
 */
const properties_js_1 = require("./properties.js");
/**
 *  When an [[EventEmitterable]] triggers a [[Listener]], the
 *  callback always ahas one additional argument passed, which is
 *  an **EventPayload**.
 */
class EventPayload {
    /**
     *  The event filter.
     */
    filter;
    /**
     *  The **EventEmitterable**.
     */
    emitter;
    #listener;
    /**
     *  Create a new **EventPayload** for %%emitter%% with
     *  the %%listener%% and for %%filter%%.
     */
    constructor(emitter, listener, filter) {
        this.#listener = listener;
        (0, properties_js_1.defineProperties)(this, { emitter, filter });
    }
    /**
     *  Unregister the triggered listener for future events.
     */
    async removeListener() {
        if (this.#listener == null) {
            return;
        }
        await this.emitter.off(this.filter, this.#listener);
    }
}
exports.EventPayload = EventPayload;
//# sourceMappingURL=events.js.map