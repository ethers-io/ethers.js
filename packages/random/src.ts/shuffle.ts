"use strict";

export function shuffled<T = any>(array: Array<T>): Array<T> {
    array = array.slice();

    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = array[i];
        array[i] = array[j];
        array[j] = tmp;
    }

    return array;
}
