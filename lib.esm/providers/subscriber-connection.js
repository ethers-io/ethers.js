import { getNumber } from "../utils/index.js";
export class BlockConnectionSubscriber {
    #provider;
    #blockNumber;
    #filterId;
    constructor(provider) {
        this.#provider = provider;
        this.#blockNumber = -2;
        this.#filterId = null;
    }
    start() {
        this.#filterId = this.#provider._subscribe(["newHeads"], (result) => {
            const blockNumber = getNumber(result.number);
            const initial = (this.#blockNumber === -2) ? blockNumber : (this.#blockNumber + 1);
            for (let b = initial; b <= blockNumber; b++) {
                this.#provider.emit("block", b);
            }
            this.#blockNumber = blockNumber;
        });
    }
    stop() {
        if (this.#filterId != null) {
            this.#provider._unsubscribe(this.#filterId);
            this.#filterId = null;
        }
    }
    pause(dropWhilePaused) {
        if (dropWhilePaused) {
            this.#blockNumber = -2;
        }
        this.stop();
    }
    resume() {
        this.start();
    }
}
//# sourceMappingURL=subscriber-connection.js.map