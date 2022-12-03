/**
 *  Explain events...
 *
 *  @_section api/utils/events:Events  [about-events]
 */
import { defineProperties } from "./properties.js";
export class EventPayload {
    filter;
    emitter;
    #listener;
    constructor(emitter, listener, filter) {
        this.#listener = listener;
        defineProperties(this, { emitter, filter });
    }
    async removeListener() {
        if (this.#listener == null) {
            return;
        }
        await this.emitter.off(this.filter, this.#listener);
    }
}
//# sourceMappingURL=events.js.map