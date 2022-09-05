"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventPayload = void 0;
const properties_js_1 = require("./properties.js");
class EventPayload {
    filter;
    emitter;
    #listener;
    constructor(emitter, listener, filter) {
        this.#listener = listener;
        (0, properties_js_1.defineProperties)(this, { emitter, filter });
    }
    async removeListener() {
        if (this.#listener == null) {
            return;
        }
        await this.emitter.off(this.filter, this.#listener);
    }
}
exports.EventPayload = EventPayload;
//# sourceMappingURL=events.js.map