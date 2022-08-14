/**
 * MIT License
 *
 * Copyright (c) 2021 Andrew Raffensperger
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * This is a near carbon-copy of the original source (link below) with the
 * TypeScript typings added and a few tweaks to make it ES3-compatible.
 *
 * See: https://github.com/adraffy/ens-normalize.js
 */

import { toUtf8CodePoints } from "@ethersproject/strings";

import { getData } from './include.js';
const r = getData();

import {read_member_array, read_mapped_map, read_emoji_trie} from './decoder.js';

import type { Node } from "./decoder.js";

// @TODO: This should be lazily loaded

const VALID = new Set(read_member_array(r));
const IGNORED = new Set(read_member_array(r));
const MAPPED = read_mapped_map(r);
const EMOJI_ROOT = read_emoji_trie(r);
//const NFC_CHECK = new Set(read_member_array(r, Array.from(VALID.values()).sort((a, b) => a - b)));

function nfc(s: string): string {
    return s.normalize('NFC');
}

function filter_fe0f(cps: Array<number>): Array<number> {
    return cps.filter(cp => cp != 0xFE0F);
}

export function ens_normalize(name: string, beautify = false): string {
    const input = toUtf8CodePoints(name).reverse(); // flip for pop
    const output = [];
    while (input.length) {		
        const emoji = consume_emoji_reversed(input, EMOJI_ROOT);
        if (emoji) {
            output.push(...(beautify ? emoji : filter_fe0f(emoji)));
            continue;
        }
        const cp = input.pop();
        if (VALID.has(cp)) {
            output.push(cp);
            continue;
        }
        if (IGNORED.has(cp)) {
            continue;
        }
		    let cps = MAPPED[cp];
        if (cps) {
            output.push(...cps);
            continue;
        }
        throw new Error(`Disallowed codepoint: 0x${cp.toString(16).toUpperCase()}`);
    }
    return nfc(String.fromCodePoint(...output));
}


function consume_emoji_reversed(cps: Array<number>, node: Node, eaten?: Array<number>) {
    let emoji;
    const stack = [];
    let pos = cps.length;
    if (eaten) { eaten.length = 0; } // clear input buffer (if needed)
    while (pos) {
        const cp = cps[--pos];
        const branch = node.branches.find(x => x.set.has(cp));
        if (branch == null) { break; }
        node = branch.node;
        if (!node) { break; }
        stack.push(cp);
        if (node.fe0f) {
            stack.push(0xFE0F);
            if (pos > 0 && cps[pos - 1] == 0xFE0F) { pos--; }
        }
        if (node.valid) { // this is a valid emoji (so far)
            emoji = stack.slice(); // copy stack
            if (eaten) { eaten.push(...cps.slice(pos).reverse()); } // copy input (if needed)
            cps.length = pos; // truncate
        }
    }
    return emoji;
}

